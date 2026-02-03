import { exportService } from '@/modules/export/export.service';
import {
  IResumeExportService,
  ResumeExportResult,
  ResumeExportStatusResult,
} from '@/modules/resume/application/services/resume-export.service.interface';

export class ResumeExportService implements IResumeExportService {
  async generatePdfBuffer(userId: string, resumeId: string): Promise<ResumeExportResult> {
    return exportService.generatePdfBuffer(userId, resumeId);
  }

  async getExportStatusForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ResumeExportStatusResult> {
    return exportService.getExportStatusForResume(userId, resumeId, exportId);
  }
}
