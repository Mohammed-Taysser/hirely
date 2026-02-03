import { fileURLToPath } from 'url';

import { Worker } from 'bullmq';

import prisma from '@/apps/prisma';
import { redisConnectionOptions } from '@/apps/redis';
import { mailerPromise } from '@/infra/mail/mailer';
import { LocalStorageAdapter } from '@/infra/storage/local.adapter';
import { activityService } from '@/modules/activity/activity.service';
import { QUEUE_NAMES } from '@/shared/constants';
import { logger } from '@/shared/logger';

const storage = new LocalStorageAdapter();

export const startEmailWorker = () => {
  return new Worker(
    QUEUE_NAMES.email,
    async (job) => {
      logger.info('Processing Email job', { jobId: job.id, exportId: job.data.exportId });
      const { exportId, userId, to, recipient, reason } = job.data as {
        exportId: string;
        userId: string;
        to: string;
        recipient?: { name?: string; company?: string; message?: string };
        reason: 'free-tier-export' | 'bulk-apply';
      };

      const exportRecord = await prisma.resumeExport.findFirst({
        where: { id: exportId, userId },
        include: { user: true },
      });

      if (!exportRecord || !exportRecord.url) {
        throw new Error('Export not ready');
      }

      if (exportRecord.status !== 'READY') {
        throw new Error('Export not ready');
      }

      const downloadUrl = await storage.getSignedDownloadUrl(exportRecord.url, 60 * 60);
      const isLocalFile = downloadUrl.startsWith('file://');
      const attachmentPath = isLocalFile ? fileURLToPath(downloadUrl) : null;

      const subject = reason === 'bulk-apply' ? 'Resume Application' : 'Your resume export';
      const greeting = recipient?.name ? `Hi ${recipient.name},` : 'Hello,';
      const companyLine = recipient?.company ? `Role at ${recipient.company}` : '';
      const message = recipient?.message ? `\n${recipient.message}` : '';

      const linkLine = isLocalFile ? '' : `\n${downloadUrl}`;
      const body = `${greeting}

Please find the resume ${isLocalFile ? 'attached' : 'at the secure link below.'}${linkLine}
${companyLine}${message}

Best regards,
${exportRecord.user.email}`;

      const mailer = await mailerPromise;

      await mailer.sendMail({
        from: process.env.MAIL_FROM || 'no-reply@hirely.app',
        to,
        subject,
        text: body,
        attachments: attachmentPath ? [{ path: attachmentPath }] : undefined,
      });

      await activityService.log(userId, 'resume.sent.email', {
        exportId,
        to,
        reason,
      });
    },
    {
      connection: redisConnectionOptions,
    }
  )
    .on('ready', () => {
      logger.info('Email worker is ready and listening');
    })
    .on('completed', (job) => {
      logger.info('Email job completed successfully', {
        jobId: job.id,
        exportId: job.data.exportId,
      });
    })
    .on('failed', (job, err) => {
      logger.error('Email job failed', { jobId: job?.id, error: err.message });
    });
};
