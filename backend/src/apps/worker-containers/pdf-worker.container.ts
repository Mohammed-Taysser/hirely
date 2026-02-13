import { auditLogService, exportService, systemLogService } from '@/apps/container.shared';
import { ProcessExportPdfUseCase } from '@/modules/resume/application/use-cases/process-export-pdf/process-export-pdf.use-case';

const processExportPdfUseCase = new ProcessExportPdfUseCase(exportService, auditLogService);

export { processExportPdfUseCase, systemLogService };
