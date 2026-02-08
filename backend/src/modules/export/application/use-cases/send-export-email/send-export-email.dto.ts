import { ExportEmailRecipient } from '@/modules/export/application/services/export-email.service.interface';

export interface SendExportEmailRequestDto {
  exportId: string;
  userId: string;
  to: string;
  recipient?: ExportEmailRecipient;
  reason: 'free-tier-export' | 'bulk-apply';
}
