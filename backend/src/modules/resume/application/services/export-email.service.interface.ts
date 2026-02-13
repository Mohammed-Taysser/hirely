export interface ExportEmailRecipient {
  name?: string;
  company?: string;
  message?: string;
}

export interface SendExportEmailRequest {
  to: string;
  subject: string;
  body: string;
  downloadUrl: string;
}

export interface IExportEmailService {
  sendEmail(request: SendExportEmailRequest): Promise<void>;
}
