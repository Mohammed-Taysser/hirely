import {
  ExportStatusResult,
  IExportStatusService,
} from '@/modules/export/application/services/export-status.service.interface';
import { ExportService } from '@/modules/export/infrastructure/services/export.service';
import { IExportService } from '@/modules/export/application/services/export.service.interface';

export class ExportStatusService implements IExportStatusService {
  constructor(private readonly exportService: IExportService = new ExportService()) {}

  async getExportStatus(userId: string, exportId: string): Promise<ExportStatusResult> {
    return this.exportService.getExportStatus(userId, exportId);
  }
}
