 import { LocalStorageAdapter } from '../../infra/storage/local.adapter';
import errorService from '@/modules/shared/services/error.service';
 import { canDirectDownload } from './export.policy';
import { billingService } from '../billing/billing.service';
import resumeService from '../resume/resume.service';
import { renderResumeHtml } from '@/infra/pdf/resume-template';
import { renderPdfFromHtml } from '@/infra/pdf/gotenberg';
import prisma from '@/apps/prisma';
import { EXPORT_EXPIRY_DAYS_FREE, EXPORT_EXPIRY_DAYS_PAID } from '@/apps/constant';

const storage = new LocalStorageAdapter();

const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

const buildStorageKey = (userId: string, exportId: string) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  return `${userId}/${dateKey}/exports/${exportId}.pdf`;
};

export const exportService = {
  async createExportRecord(userId: string, snapshotId: string) {
    return prisma.resumeExport.create({
      data: {
        userId,
        snapshotId,
        status: 'PENDING',
      },
    });
  },

  async markReady(exportId: string, storageKey: string, planCode: string) {
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
  },

  async enforceExportLimit(userId: string, planId: string) {
    const planLimit = await prisma.planLimit.findUnique({ where: { planId } });
    if (!planLimit) {
      throw errorService.forbidden('Plan limits are not configured');
    }

    const exportCount = await prisma.resumeExport.count({ where: { userId } });
    if (exportCount >= planLimit.maxExports) {
      throw errorService.forbidden('Export limit reached for your plan');
    }
  },

  async markFailed(exportId: string, reason: string) {
    return prisma.resumeExport.update({
      where: { id: exportId },
      data: {
        status: 'FAILED',
        error: reason,
      },
    });
  },

  async getExportStatus(userId: string, exportId: string) {
    const exportRecord = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId },
      include: { user: { include: { plan: true } } },
    });

    if (!exportRecord) {
      throw errorService.notFound('Export not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(exportRecord.user.plan?.code ?? '')) {
        downloadUrl = await storage.getSignedDownloadUrl(exportRecord.url, 60 * 10);
      }
    }

    return {
      id: exportRecord.id,
      status: exportRecord.status,
      error: exportRecord.error,
      expiresAt: exportRecord.expiresAt,
      downloadUrl,
    };
  },

  async generatePdfBuffer(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { data: true, templateId: true, themeConfig: true },
    });

    if (!resume) {
      throw errorService.notFound('Resume not found');
    }

    const html = renderResumeHtml(resume.data, {
      templateId: resume.templateId,
      themeConfig: (resume.themeConfig as Record<string, unknown> | null) ?? undefined,
    });
    const pdfBuffer = await renderPdfFromHtml(html);

    return { pdfBuffer };
  },

  async generateAndStoreExport(userId: string, resumeId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });

    if (!user?.plan) {
      throw errorService.notFound('User plan not found');
    }

    await this.enforceExportLimit(userId, user.planId);

    const snapshot = await resumeService.createSnapshot(userId, resumeId);
    if (!snapshot) {
      throw errorService.notFound('Resume not found');
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

    await billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

    const key = buildStorageKey(userId, exportRecord.id);
    const upload = await storage.uploadBuffer(pdfBuffer, key, {
      contentType: 'application/pdf',
      contentDisposition: `attachment; filename="resume-${exportRecord.id}.pdf"`,
    });

    await this.markReady(exportRecord.id, upload.key, user.plan.code);

    return { exportRecordId: exportRecord.id, pdfBuffer, storageKey: upload.key };
  },

  async getExportStatusForResume(userId: string, resumeId: string, exportId: string) {
    const exportRecord = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId, snapshot: { resumeId } },
      include: { user: { include: { plan: true } } },
    });

    if (!exportRecord) {
      throw errorService.notFound('Export not found');
    }

    let downloadUrl: string | null = null;
    if (exportRecord.status === 'READY' && exportRecord.url) {
      if (canDirectDownload(exportRecord.user.plan?.code ?? '')) {
        downloadUrl = await storage.getSignedDownloadUrl(exportRecord.url, 60 * 10);
      }
    }

    return {
      id: exportRecord.id,
      status: exportRecord.status,
      error: exportRecord.error,
      expiresAt: exportRecord.expiresAt,
      downloadUrl,
    };
  },
};
