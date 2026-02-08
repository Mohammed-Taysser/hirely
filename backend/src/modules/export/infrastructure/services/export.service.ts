import { LocalStorageAdapter } from '@/infra/storage/local.adapter';
import { renderPdfFromHtml } from '@/infra/pdf/gotenberg';
import { renderResumeHtml } from '@/infra/pdf/resume-template';
import prisma from '@/apps/prisma';
import { EXPORT_EXPIRY_DAYS_FREE, EXPORT_EXPIRY_DAYS_PAID } from '@/apps/constant';
import { canDirectDownload } from '@/modules/export/export.policy';
import { ForbiddenError, NotFoundError } from '@/modules/shared/application/app-error';
import {
  ExportRecord,
  IExportService,
} from '@/modules/export/application/services/export.service.interface';
import { ExportStatusResult } from '@/modules/export/application/services/export-status.service.interface';
import { ResumeExportResult } from '@/modules/resume/application/services/resume-export.service.interface';
import { PrismaResumeSnapshotRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-snapshot.repository';
import { IResumeSnapshotRepository } from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';
import { IExportEmailQueueService } from '@/modules/export/application/services/export-email-queue.service.interface';
import { BullmqExportEmailQueueService } from '@/modules/export/infrastructure/services/bullmq-export-email-queue.service';
import { IBillingService } from '@/modules/billing/application/services/billing.service.interface';
import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';
import { BillingService } from '@/modules/billing/infrastructure/services/billing.service';
import { ActivityService } from '@/modules/activity/infrastructure/services/activity.service';

const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

const buildStorageKey = (userId: string, exportId: string) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  return `${userId}/${dateKey}/exports/${exportId}.pdf`;
};

export class ExportService implements IExportService {
  constructor(
    private readonly resumeSnapshotRepository: IResumeSnapshotRepository = new PrismaResumeSnapshotRepository(),
    private readonly storage = new LocalStorageAdapter(),
    private readonly exportEmailQueueService: IExportEmailQueueService = new BullmqExportEmailQueueService(),
    private readonly billingService: IBillingService = new BillingService(),
    private readonly activityService: IActivityService = new ActivityService()
  ) {}

  async createExportRecord(userId: string, snapshotId: string): Promise<ExportRecord> {
    return prisma.resumeExport.create({
      data: {
        userId,
        snapshotId,
        status: 'PENDING',
      },
    });
  }

  async markReady(exportId: string, storageKey: string, planCode: string): Promise<ExportRecord> {
    const expiresAt = new Date(
      Date.now() + daysToMs(planCode === 'FREE' ? EXPORT_EXPIRY_DAYS_FREE : EXPORT_EXPIRY_DAYS_PAID)
    );

    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        url: storageKey,
        expiresAt,
        status: 'READY',
        error: null,
      },
    });
  }

  async enforceExportLimit(userId: string, planId: string): Promise<void> {
    const planLimit = await prisma.planLimit.findUnique({ where: { planId } });
    if (!planLimit) {
      throw new ForbiddenError('Plan limits are not configured');
    }

    const exportCount = await prisma.resumeExport.count({ where: { userId } });
    if (exportCount >= planLimit.maxExports) {
      throw new ForbiddenError('Export limit reached for your plan');
    }
  }

  async markFailed(exportId: string, reason: string): Promise<ExportRecord> {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        status: 'FAILED',
        error: reason,
      },
    });
  }

  async getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult> {
    const exportRecord = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId },
      include: { user: { include: { plan: true } } },
    });

    if (!exportRecord) {
      throw new NotFoundError('Export not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(exportRecord.user.plan?.code ?? '')) {
        downloadUrl = await this.storage.getSignedDownloadUrl(exportRecord.url, 60 * 10);
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
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { data: true, templateId: true, themeConfig: true },
    });

    if (!resume) {
      throw new NotFoundError('Resume not found');
    }

    const html = renderResumeHtml(resume.data, {
      templateId: resume.templateId,
      themeConfig: (resume.themeConfig as Record<string, unknown> | null) ?? undefined,
    });
    const pdfBuffer = await renderPdfFromHtml(html);

    return { pdfBuffer };
  }

  async generateAndStoreExport(
    userId: string,
    resumeId: string
  ): Promise<{ exportRecordId: string; pdfBuffer: Buffer; storageKey: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      throw new NotFoundError('User plan not found');
    }

    await this.enforceExportLimit(userId, user.planId);

    const snapshot = await this.resumeSnapshotRepository.createSnapshot(userId, resumeId);
    if (!snapshot) {
      throw new NotFoundError('Resume not found');
    }

    const exportRecord = await this.createExportRecord(userId, snapshot.id);

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { templateId: true, themeConfig: true },
    });

    const html = renderResumeHtml(snapshot.data, {
      templateId: resume?.templateId,
      themeConfig: (resume?.themeConfig as Record<string, unknown> | null) ?? undefined,
    });
    const pdfBuffer = await renderPdfFromHtml(html);

    await this.billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

    const key = buildStorageKey(userId, exportRecord.id);
    const upload = await this.storage.uploadBuffer(pdfBuffer, key, {
      contentType: 'application/pdf',
      contentDisposition: `attachment; filename="resume-${exportRecord.id}.pdf"`,
    });

    await this.markReady(exportRecord.id, upload.key, user.plan.code);

    return { exportRecordId: exportRecord.id, pdfBuffer, storageKey: upload.key };
  }

  async getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ExportStatusResult> {
    const exportRecord = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId, snapshot: { resumeId } },
      include: { user: { include: { plan: true } } },
    });

    if (!exportRecord) {
      throw new NotFoundError('Export not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(exportRecord.user.plan?.code ?? '')) {
        downloadUrl = await this.storage.getSignedDownloadUrl(exportRecord.url, 60 * 10);
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

    const snapshot = await prisma.resumeSnapshot.findFirst({
      where: { id: snapshotId, userId },
      include: {
        resume: {
          select: {
            templateId: true,
            themeConfig: true,
          },
        },
      },
    });

    if (!snapshot) {
      throw new NotFoundError('Snapshot not found');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const html = renderResumeHtml(snapshot.data, {
      templateId: snapshot.resume?.templateId,
      themeConfig: (snapshot.resume?.themeConfig as Record<string, unknown> | null) ?? undefined,
    });
    const pdfBuffer = await renderPdfFromHtml(html);

    try {
      await this.billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

      const key = buildStorageKey(userId, exportId);
      const upload = await this.storage.uploadBuffer(pdfBuffer, key, {
        contentType: 'application/pdf',
        contentDisposition: `attachment; filename="resume-${exportId}.pdf"`,
      });

      await this.markReady(exportId, upload.key, user.plan?.code ?? 'FREE');
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
