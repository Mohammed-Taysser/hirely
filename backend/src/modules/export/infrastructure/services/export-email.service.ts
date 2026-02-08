import { fileURLToPath } from 'url';

import prisma from '@/apps/prisma';
import { mailerPromise } from '@/infra/mail/mailer';
import { LocalStorageAdapter } from '@/infra/storage/local.adapter';
import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';
import { ActivityService } from '@/modules/activity/infrastructure/services/activity.service';
import {
  IExportEmailService,
  SendExportEmailRequest,
} from '@/modules/export/application/services/export-email.service.interface';
import { NotFoundError } from '@/modules/shared/application/app-error';

const storage = new LocalStorageAdapter();

export class ExportEmailService implements IExportEmailService {
  constructor(private readonly activityService: IActivityService = new ActivityService()) {}

  async sendExportEmail(request: SendExportEmailRequest): Promise<void> {
    const { exportId, userId, to, recipient, reason } = request;

    const exportRecord = await prisma.resumeExport.findFirst({
      where: { id: exportId, userId },
      include: { user: true },
    });

    if (!exportRecord || !exportRecord.url) {
      throw new NotFoundError('Export not ready');
    }

    if (exportRecord.status !== 'READY') {
      throw new NotFoundError('Export not ready');
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

    await this.activityService.log(userId, 'resume.sent.email', {
      exportId,
      to,
      reason,
    });
  }
}
