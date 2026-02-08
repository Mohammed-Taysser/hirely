export interface ExportEmailRecipient {
  name?: string;
  company?: string;
  message?: string;
}

export interface SendExportEmailRequest {
  exportId: string;
  userId: string;
  to: string;
  recipient?: ExportEmailRecipient;
  reason: 'free-tier-export' | 'bulk-apply';
}

export interface IExportEmailService {
  sendExportEmail(request: SendExportEmailRequest): Promise<void>;
}
