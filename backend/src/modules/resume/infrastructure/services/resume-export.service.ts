import { ExportService } from '@/modules/export/infrastructure/services/export.service';
import { IExportService } from '@/modules/export/application/services/export.service.interface';
import {
  IResumeExportService,
  ResumeExportResult,
  ResumeExportStatusResult,
} from '@/modules/resume/application/services/resume-export.service.interface';

export class ResumeExportService implements IResumeExportService {
  constructor(private readonly exportService: IExportService = new ExportService()) {}

  async generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult> {
    return this.exportService.generatePdfBuffer(userId, resumeId);
  }

  async getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ResumeExportStatusResult> {
    return this.exportService.getExportStatusForResume(userId, resumeId, exportId);
  }
}
