import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';
import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import {
  hasReachedExportLimit,
  requirePlanUsageLimits,
} from '@/modules/plan/application/policies/plan-limit.policy';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import {
  canDirectDownload,
  getExportExpiryDays,
} from '@/modules/resume/application/policies/export.policy';
import { IResumeExportQueryRepository } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { IResumeSnapshotQueryRepository } from '@/modules/resume/application/repositories/resume-snapshot.query.repository.interface';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { IExportEmailQueueService } from '@/modules/resume/application/services/export-email-queue.service.interface';
import { ExportStatusResult } from '@/modules/resume/application/services/export-status.service.interface';
import { IExportStorageService } from '@/modules/resume/application/services/export-storage.service.interface';
import {
  ExportRecord,
  IExportService,
} from '@/modules/resume/application/services/export.service.interface';
import { IPdfRenderer } from '@/modules/resume/application/services/pdf-renderer.service.interface';
import { ResumeExportResult } from '@/modules/resume/application/services/resume-export.service.interface';
import { IResumeTemplateRenderer } from '@/modules/resume/application/services/resume-template-renderer.service.interface';
import { ForbiddenError, NotFoundError } from '@/modules/shared/application/app-error';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

const buildStorageKey = (userId: string, exportId: string) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  return `${userId}/${dateKey}/exports/${exportId}.pdf`;
};

export class ExportService implements IExportService {
  constructor(
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository,
    private readonly storageService: IExportStorageService,
    private readonly exportEmailQueueService: IExportEmailQueueService,
    private readonly billingService: IBillingService,
    private readonly activityService: IActivityService,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly resumeExportRepository: IResumeExportRepository,
    private readonly resumeExportQueryRepository: IResumeExportQueryRepository,
    private readonly resumeSnapshotQueryRepository: IResumeSnapshotQueryRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly pdfRenderer: IPdfRenderer,
    private readonly resumeTemplateRenderer: IResumeTemplateRenderer
  ) {}

  async createExportRecord(
    userId: string,
    snapshotId: string,
    options?: { idempotencyKey?: string }
  ): Promise<ExportRecord> {
    return this.resumeExportRepository.create(userId, snapshotId, options);
  }

  async markReady(
    exportId: string,
    storageKey: string,
    sizeBytes: number,
    planCode: string
  ): Promise<ExportRecord> {
    const expiresAt = new Date(Date.now() + daysToMs(getExportExpiryDays(planCode)));

    return this.resumeExportRepository.markReady(exportId, storageKey, sizeBytes, expiresAt);
  }

  async enforceExportLimit(userId: string, planId: string): Promise<void> {
    const planLimit = await this.planLimitQueryRepository.findByPlanId(planId);
    const planUsageLimits = requirePlanUsageLimits(planLimit);

    const exportCount = await this.resumeExportRepository.countByUser(userId);
    if (hasReachedExportLimit(exportCount, planUsageLimits.maxExports)) {
      throw new ForbiddenError('Export limit reached for your plan');
    }
  }

  async markFailed(exportId: string, reason: string): Promise<ExportRecord> {
    return this.resumeExportRepository.markFailed(exportId, reason);
  }

  async getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult> {
    const exportRecord = await this.resumeExportQueryRepository.findById(userId, exportId);

    if (!exportRecord) {
      throw new NotFoundError('Export not found');
    }

    const user = await this.userQueryRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(user.plan?.code ?? '')) {
        downloadUrl = await this.storageService.getSignedDownloadUrl(exportRecord.url, 60 * 10);
      }
    }

    return {
      id: exportRecord.id,
      status: exportRecord.status,
      error: exportRecord.error,
      expiresAt: exportRecord.expiresAt,
      downloadUrl,
    };
  }

  async generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult> {
    const resume = await this.resumeQueryRepository.findByIdForExport(userId, resumeId);

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    const html = this.resumeTemplateRenderer.renderHtml(resume.data, {
      templateId: resume.templateId ?? undefined,
      themeConfig: resume.themeConfig ?? undefined,
    });
    const pdfBuffer = await this.pdfRenderer.renderPdfFromHtml(html);

    return { pdfBuffer };
  }

  async generateAndStoreExport(
    userId: string,
    resumeId: string
  ): Promise<{ exportRecordId: string; pdfBuffer: Buffer; storageKey: string }> {
    const user = await this.userQueryRepository.findById(userId);

    if (!user?.plan) {
      throw new NotFoundError('User plan not found');
    }

    await this.enforceExportLimit(userId, user.planId);

    const snapshot = await this.resumeSnapshotRepository.createSnapshot(userId, resumeId);
    if (!snapshot) {
      throw new NotFoundError('Resume not found');
    }

    const exportRecord = await this.createExportRecord(userId, snapshot.id);

    const resume = await this.resumeQueryRepository.findByIdForExport(userId, resumeId);

    const html = this.resumeTemplateRenderer.renderHtml(snapshot.data, {
      templateId: resume?.templateId ?? undefined,
      themeConfig: resume?.themeConfig ?? undefined,
    });
    const pdfBuffer = await this.pdfRenderer.renderPdfFromHtml(html);

    await this.billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

    const key = buildStorageKey(userId, exportRecord.id);
    const upload = await this.storageService.uploadBuffer(pdfBuffer, key, {
      contentType: 'application/pdf',
      contentDisposition: `attachment; filename="resume-${exportRecord.id}.pdf"`,
    });

    await this.markReady(exportRecord.id, upload.key, pdfBuffer.length, user.plan.code);

    return { exportRecordId: exportRecord.id, pdfBuffer, storageKey: upload.key };
  }

  async getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ExportStatusResult> {
    const exportRecord = await this.resumeExportQueryRepository.findByIdForResume(
      userId,
      resumeId,
      exportId
    );

    if (!exportRecord) {
      throw new NotFoundError('Export not found');
    }

    const user = await this.userQueryRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(user.plan?.code ?? '')) {
        downloadUrl = await this.storageService.getSignedDownloadUrl(exportRecord.url, 60 * 10);
      }
    }

    return {
      id: exportRecord.id,
      status: exportRecord.status,
      error: exportRecord.error,
      expiresAt: exportRecord.expiresAt,
      downloadUrl,
    };
  }

  async processPdfExport(input: {
    exportId: string;
    snapshotId: string;
    userId: string;
  }): Promise<void> {
    const { exportId, snapshotId, userId } = input;

    const snapshot = await this.resumeSnapshotQueryRepository.findByIdWithResume(
      userId,
      snapshotId
    );

    if (!snapshot) {
      throw new NotFoundError('Snapshot not found');
    }

    const user = await this.userQueryRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const html = this.resumeTemplateRenderer.renderHtml(snapshot.data, {
      templateId: snapshot.templateId ?? undefined,
      themeConfig: snapshot.themeConfig ?? undefined,
    });
    const pdfBuffer = await this.pdfRenderer.renderPdfFromHtml(html);

    try {
      await this.billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

      const key = buildStorageKey(userId, exportId);
      const upload = await this.storageService.uploadBuffer(pdfBuffer, key, {
        contentType: 'application/pdf',
        contentDisposition: `attachment; filename="resume-${exportId}.pdf"`,
      });

      await this.markReady(exportId, upload.key, pdfBuffer.length, user.plan?.code ?? 'FREE');
      await this.activityService.log(userId, 'resume.exported', {
        exportId,
        snapshotId,
        storageKey: upload.key,
      });

      if (!canDirectDownload(user.plan?.code ?? 'FREE')) {
        await this.exportEmailQueueService.enqueue({
          exportId,
          userId,
          to: user.email,
          reason: 'free-tier-export',
        });
      }
    } catch (error) {
      await this.markFailed(exportId, error instanceof Error ? error.message : 'PDF failed');
      throw error;
    }
  }
}
