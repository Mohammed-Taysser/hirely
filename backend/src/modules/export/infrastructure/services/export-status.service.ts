import { exportService } from '@/modules/export/export.service';
import {
  ExportStatusResult,
  IExportStatusService,
} from '@/modules/export/application/services/export-status.service.interface';

export class ExportStatusService implements IExportStatusService {
  async getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult> {
    return exportService.getExportStatus(userId, exportId);
  }
}
