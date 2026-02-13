import { fileURLToPath } from 'url';

import nodemailer from 'nodemailer';

import {
  IExportEmailService,
  SendExportEmailRequest,
} from '@/modules/resume/application/services/export-email.service.interface';

async function createMailer() {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

const mailerPromise = createMailer();

export class ExportEmailService implements IExportEmailService {
  async sendEmail(request: SendExportEmailRequest): Promise<void> {
    const { to, subject, body, downloadUrl } = request;
    const isLocalFile = downloadUrl.startsWith('file://');
    const attachmentPath = isLocalFile ? fileURLToPath(downloadUrl) : null;

    const mailer = await mailerPromise;

    await mailer.sendMail({
      from: process.env.MAIL_FROM || 'no-reply@hirely.app',
      to,
      subject,
      text: body,
      attachments: attachmentPath ? [{ path: attachmentPath }] : undefined,
    });
  }
}
