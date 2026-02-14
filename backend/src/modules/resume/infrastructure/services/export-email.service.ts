import { fileURLToPath } from 'url';

import nodemailer, { Transporter } from 'nodemailer';

import CONFIG from '@/apps/config';
import {
  IExportEmailService,
  SendExportEmailRequest,
} from '@/modules/resume/application/services/export-email.service.interface';

type EmailRuntimeConfig = Pick<
  typeof CONFIG,
  'NODE_ENV' | 'MAIL_FROM' | 'SMTP_HOST' | 'SMTP_PORT' | 'SMTP_USER' | 'SMTP_PASS'
>;

const hasSmtpConfig = (config: EmailRuntimeConfig): boolean =>
  Boolean(config.SMTP_HOST && config.SMTP_PORT && config.SMTP_USER && config.SMTP_PASS);

const buildSmtpTransport = (config: EmailRuntimeConfig) =>
  nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: Number(config.SMTP_PORT) === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

const buildFallbackTransport = () =>
  // sonarjs false positive: nodemailer transport factory, not an insecure protocol URL
  // eslint-disable-next-line sonarjs/no-clear-text-protocols
  nodemailer.createTransport({
    jsonTransport: true,
  });

export class ExportEmailService implements IExportEmailService {
  private readonly transport: Transporter;
  private readonly config: EmailRuntimeConfig;

  constructor(config: EmailRuntimeConfig = CONFIG) {
    this.config = config;

    if (config.NODE_ENV === 'production' && !hasSmtpConfig(config)) {
      throw new Error('SMTP configuration is required in production');
    }

    this.transport = hasSmtpConfig(config) ? buildSmtpTransport(config) : buildFallbackTransport();
  }

  async sendEmail(request: SendExportEmailRequest): Promise<void> {
    const { to, subject, body, downloadUrl } = request;
    const isLocalFile = downloadUrl.startsWith('file://');
    const attachmentPath = isLocalFile ? fileURLToPath(downloadUrl) : null;

    await this.transport.sendMail({
      from: this.config.MAIL_FROM,
      to,
      subject,
      text: body,
      attachments: attachmentPath ? [{ path: attachmentPath }] : undefined,
    });
  }
}

export { buildFallbackTransport, buildSmtpTransport, hasSmtpConfig };
