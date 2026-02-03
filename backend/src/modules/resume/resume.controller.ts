import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { ResumeDTO } from './resume.dto';
import {
  getResumeExportsFilter,
  getResumesFilter,
  getResumeSnapshotsFilter,
  normalizeResumeData,
} from './resume.utils';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { FindResumeByIdUseCase } from '@/modules/resume/application/use-cases/find-resume-by-id/find-resume-by-id.use-case';
import { CreateResumeUseCase } from '@/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { UpdateResumeUseCase } from '@/modules/resume/application/use-cases/update-resume/update-resume.use-case';
import { DeleteResumeUseCase } from '@/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import { CreateResumeSnapshotUseCase } from '@/modules/resume/application/use-cases/create-resume-snapshot/create-resume-snapshot.use-case';
import { ExportResumeUseCase } from '@/modules/resume/application/use-cases/export-resume/export-resume.use-case';
import { GetResumeByIdQueryUseCase } from '@/modules/resume/application/use-cases/get-resume-by-id-query/get-resume-by-id-query.use-case';
import { GetResumeExportsUseCase } from '@/modules/resume/application/use-cases/get-resume-exports/get-resume-exports.use-case';
import { GetResumeExportStatusUseCase } from '@/modules/resume/application/use-cases/get-resume-export-status/get-resume-export-status.use-case';
import { EnqueueResumeExportUseCase } from '@/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case';
import { GetResumesUseCase } from '@/modules/resume/application/use-cases/get-resumes/get-resumes.use-case';
import { GetResumesListUseCase } from '@/modules/resume/application/use-cases/get-resumes-list/get-resumes-list.use-case';
import { GetResumeSnapshotsUseCase } from '@/modules/resume/application/use-cases/get-resume-snapshots/get-resume-snapshots.use-case';
import { PrismaResumeRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.repository';
import { PrismaResumeQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.query.repository';
import { PrismaResumeSnapshotRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-snapshot.repository';
import { PrismaResumeExportQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-export.query.repository';
import { ResumeExportService } from '@/modules/resume/infrastructure/services/resume-export.service';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';
import { PrismaPlanLimitQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan-limit.query.repository';

const resumeRepository = new PrismaResumeRepository();
const resumeQueryRepository = new PrismaResumeQueryRepository();
const resumeSnapshotRepository = new PrismaResumeSnapshotRepository();
const resumeExportQueryRepository = new PrismaResumeExportQueryRepository();
const resumeExportService = new ResumeExportService();
const planLimitQueryRepository = new PrismaPlanLimitQueryRepository();
const findResumeByIdUseCase = new FindResumeByIdUseCase(resumeRepository);
const createResumeUseCase = new CreateResumeUseCase(resumeRepository, planLimitQueryRepository);
const updateResumeUseCase = new UpdateResumeUseCase(resumeRepository);
const deleteResumeUseCase = new DeleteResumeUseCase(resumeRepository);
const createResumeSnapshotUseCase = new CreateResumeSnapshotUseCase(resumeSnapshotRepository);
const exportResumeUseCase = new ExportResumeUseCase(resumeExportService);
const getResumeByIdQueryUseCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
const getResumeExportsUseCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
const getResumeExportStatusUseCase = new GetResumeExportStatusUseCase(resumeExportService);
const enqueueResumeExportUseCase = new EnqueueResumeExportUseCase();
const getResumesUseCase = new GetResumesUseCase(resumeQueryRepository);
const getResumesListUseCase = new GetResumesListUseCase(resumeQueryRepository);
const getResumeSnapshotsUseCase = new GetResumeSnapshotsUseCase(resumeQueryRepository);

async function getResumes(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumesList']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getResumesFilter(request);

  const result = await getResumesUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { resumes, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Resumes fetched successfully',
    data: resumes,
    metadata: {
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function getResumesList(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumesList']>;
  const filters = getResumesFilter(request);

  const result = await getResumesListUseCase.execute({ filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const resumes = result.getValue();

  responseService.success(response, {
    message: 'Resumes fetched successfully',
    data: resumes,
  });
}

async function getResumeById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeById']>;
  const { resumeId } = request.parsedParams;

  const result = await getResumeByIdQueryUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const resume = result.getValue();

  responseService.success(response, {
    message: 'Resume fetched successfully',
    data: resume,
  });
}

async function getResumeSnapshots(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeSnapshots']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getResumeSnapshotsFilter(request);

  const result = await getResumeSnapshotsUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { snapshots, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Resume snapshots fetched successfully',
    data: snapshots,
    metadata: {
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function getResumeExports(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeExports']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getResumeExportsFilter(request);

  const result = await getResumeExportsUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { exports, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Resume exports fetched successfully',
    data: exports,
    metadata: {
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function exportResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['exportResume']>;
  const { resumeId } = request.parsedParams;

  const result = await exportResumeUseCase.execute({
    userId: request.user.id,
    resumeId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename="resume-${resumeId}.pdf"`);
  response.status(200).send(result.getValue().pdfBuffer);
}

async function enqueueExport(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['enqueueExport']>;
  const { resumeId } = request.parsedParams;
  const { store } = request.parsedBody;

  if (!store) {
    throw errorService.badRequest('Use /resumes/:resumeId/export/download for direct download');
  }

  const result = await enqueueResumeExportUseCase.execute({
    user: request.user,
    resumeId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Export started',
    data: result.getValue(),
  });
}

async function getResumeExportStatus(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeExportStatus']>;
  const { resumeId, exportId } = request.parsedParams;

  const result = await getResumeExportStatusUseCase.execute({
    userId: request.user.id,
    resumeId,
    exportId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Export status fetched successfully',
    data: result.getValue(),
  });
}

async function createResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['createResume']>;
  const body = request.parsedBody;

  const result = await createResumeUseCase.execute({
    userId: request.user.id,
    planId: request.user.planId,
    name: body.name,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
    data: normalizeResumeData(body.data),
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const resumeResult = await getResumeByIdQueryUseCase.execute({
    resumeId: result.getValue().id,
    userId: request.user.id,
  });

  if (resumeResult.isFailure) {
    throw mapAppErrorToHttp(resumeResult.error);
  }

  const resume = resumeResult.getValue();

  responseService.success(response, {
    message: 'Resume created successfully',
    data: resume,
    statusCode: StatusCodes.CREATED,
  });
}

async function updateResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['updateResume']>;
  const { resumeId } = request.parsedParams;
  const body = request.parsedBody;

  const result = await updateResumeUseCase.execute({
    resumeId,
    userId: request.user.id,
    name: body.name,
    data: body.data ? normalizeResumeData(body.data) : undefined,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const updatedResumeResult = await getResumeByIdQueryUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (updatedResumeResult.isFailure) {
    throw mapAppErrorToHttp(updatedResumeResult.error);
  }

  const updatedResume = updatedResumeResult.getValue();

  const snapshotResult = await createResumeSnapshotUseCase.execute({
    userId: request.user.id,
    resumeId,
  });

  if (snapshotResult.isFailure) {
    throw mapAppErrorToHttp(snapshotResult.error);
  }

  responseService.success(response, {
    message: 'Resume updated successfully',
    data: updatedResume,
  });
}

async function deleteResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeById']>;
  const { resumeId } = request.parsedParams;

  const existingResult = await getResumeByIdQueryUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (existingResult.isFailure) {
    throw mapAppErrorToHttp(existingResult.error);
  }

  const existing = existingResult.getValue();

  const result = await deleteResumeUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const deleted = existing;

  responseService.success(response, {
    message: 'Resume deleted successfully',
    data: deleted,
  });
}

const resumeController = {
  getResumes,
  getResumesList,
  getResumeById,
  getResumeSnapshots,
  getResumeExports,
  exportResume,
  enqueueExport,
  getResumeExportStatus,
  createResume,
  updateResume,
  deleteResume,
};

export default resumeController;
