import { Worker } from 'bullmq';

import { QUEUE_NAMES } from '@/apps/constant';
import prisma from '@/apps/prisma';
import { redisConnectionOptions } from '@/apps/redis';
import { renderPdfFromHtml } from '@/infra/pdf/gotenberg';
import { renderResumeHtml } from '@/infra/pdf/resume-template';
import { LocalStorageAdapter } from '@/infra/storage/local.adapter';
import emailQueue from '@/jobs/queues/email.queue';
import { activityService } from '@/modules/activity/activity.service';
import { billingService } from '@/modules/billing/billing.service';
import { canDirectDownload } from '@/modules/export/export.policy';
import { exportService } from '@/modules/export/export.service';
import { logger } from '@/shared/logger';

const storage = new LocalStorageAdapter();

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const startPdfWorker = () => {
  return new Worker(
    QUEUE_NAMES.pdf,
    async (job) => {
      logger.info('Processing PDF job', { jobId: job.id, exportId: job.data.exportId });
      const { exportId, snapshotId, userId } = job.data as {
        exportId: string;
        snapshotId: string;
        userId: string;
      };

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
        throw new Error('Snapshot not found');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const html = renderResumeHtml(snapshot.data, {
        templateId: snapshot.resume?.templateId,
        themeConfig: (snapshot.resume?.themeConfig as Record<string, unknown> | null) ?? undefined,
      });
      const pdfBuffer = await renderPdfFromHtml(html);

      try {
        await billingService.enforceDailyUploadLimit(userId, user.planId, pdfBuffer.length);

        const dateKey = formatDateKey(new Date());
        const key = `${userId}/${dateKey}/exports/${exportId}.pdf`;
        const upload = await storage.uploadBuffer(pdfBuffer, key, {
          contentType: 'application/pdf',
          contentDisposition: `attachment; filename="resume-${exportId}.pdf"`,
        });

        await exportService.markReady(exportId, upload.key, user.plan?.code ?? 'FREE');
        await activityService.log(userId, 'resume.exported', {
          exportId,
          snapshotId,
          storageKey: upload.key,
        });

        if (!canDirectDownload(user.plan?.code ?? 'FREE')) {
          await emailQueue.add(
            'send',
            {
              exportId,
              userId,
              to: user.email,
              reason: 'free-tier-export',
            },
            {
              attempts: 3,
              backoff: { type: 'exponential', delay: 10000 },
            }
          );
        }
      } catch (error) {
        logger.error('PDF generation failed', { exportId, error });
        await exportService.markFailed(
          exportId,
          error instanceof Error ? error.message : 'PDF failed'
        );
        throw error;
      }
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logger.info('PDF worker is ready and listening');
    })
    .on('completed', (job) => {
      logger.info('PDF job completed successfully', { jobId: job.id, exportId: job.data.exportId });
    })
    .on('failed', (job, err) => {
      console.log(err);
      
      logger.error('PDF job failed', { jobId: job?.id, error: err.message });
    });
};
