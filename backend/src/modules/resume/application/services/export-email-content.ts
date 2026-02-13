import { ExportEmailRecipient } from '@/modules/resume/application/services/export-email.service.interface';

type ExportEmailContentInput = {
  senderEmail: string;
  recipient?: ExportEmailRecipient;
  reason: 'free-tier-export' | 'bulk-apply';
  downloadUrl?: string | null;
  isAttachment: boolean;
};

type ExportEmailContent = {
  subject: string;
  body: string;
};

const buildExportEmailContent = (input: ExportEmailContentInput): ExportEmailContent => {
  const { senderEmail, recipient, reason, downloadUrl, isAttachment } = input;

  const subject = reason === 'bulk-apply' ? 'Resume Application' : 'Your resume export';
  const greeting = recipient?.name ? `Hi ${recipient.name},` : 'Hello,';
  const companyLine = recipient?.company ? `Role at ${recipient.company}` : '';
  const message = recipient?.message ? `\n${recipient.message}` : '';
  let linkLine = '';
  if (!isAttachment && downloadUrl) {
    linkLine = `\n${downloadUrl}`;
  }

  const body = `${greeting}

Please find the resume ${isAttachment ? 'attached' : 'at the secure link below.'}${linkLine}
${companyLine}${message}

Best regards,
${senderEmail}`;

  return { subject, body };
};

export { buildExportEmailContent };
