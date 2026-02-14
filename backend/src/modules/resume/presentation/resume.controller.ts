import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { ResumeDTO } from './resume.dto';
import { getResumeExportsFilter, getResumesFilter, getResumeSnapshotsFilter } from './resume.utils';

import { resumeContainer } from '@/apps/container';
import { normalizeResumeData } from '@/modules/resume/presentation/resume-data.normalizer';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import errorService from '@/modules/shared/presentation/error.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/presentation/import';
import responseService from '@/modules/shared/presentation/response.service';

const {
  getResumesUseCase,
  getResumesListUseCase,
  getResumeByIdQueryUseCase,
  getResumeSnapshotsUseCase,
  getResumeExportsUseCase,
  getFailedExportsUseCase,
  getFailedExportEmailJobsUseCase,
  getExportStatusUseCase,
  retryFailedExportUseCase,
  retryFailedExportEmailJobUseCase,
  getResumeExportStatusUseCase,
  exportResumeUseCase,
  enqueueResumeExportUseCase,
  createResumeUseCase,
  updateResumeUseCase,
  deleteResumeUseCase,
  setDefaultResumeUseCase,
} = resumeContainer;

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

async function getFailedExports(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getFailedExports']>;
  const query = request.parsedQuery;

  const result = await getFailedExportsUseCase.execute({
    userId: request.user.id,
    page: query.page,
    limit: query.limit,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { exports, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Failed exports fetched successfully',
    data: exports,
    metadata: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

async function getFailedExportEmailJobs(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getFailedExportEmailJobs']>;
  const query = request.parsedQuery;

  const result = await getFailedExportEmailJobsUseCase.execute({
    userId: request.user.id,
    page: query.page,
    limit: query.limit,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { jobs, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Failed export email jobs fetched successfully',
    data: jobs,
    metadata: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

async function getExportStatus(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['exportStatus']>;
  const { exportId } = request.parsedParams;

  const result = await getExportStatusUseCase.execute({
    userId: request.user.id,
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

async function retryFailedExport(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['retryFailedExport']>;
  const { exportId } = request.parsedParams;

  const result = await retryFailedExportUseCase.execute({
    userId: request.user.id,
    exportId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Failed export retried successfully',
    data: result.getValue(),
  });
}

async function retryFailedExportEmailJob(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['retryFailedExportEmailJob']>;
  const { jobId } = request.parsedParams;

  const result = await retryFailedExportEmailJobUseCase.execute({
    userId: request.user.id,
    failedJobId: jobId,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Failed export email job retried successfully',
    data: result.getValue(),
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
  const { store, idempotencyKey } = request.parsedBody;

  if (!store) {
    throw errorService.badRequest('Use /resumes/:resumeId/export/download for direct download');
  }

  const result = await enqueueResumeExportUseCase.execute({
    user: request.user,
    resumeId,
    idempotencyKey,
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

  const resume = result.getValue();

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
  const updatedResume = result.getValue();

  responseService.success(response, {
    message: 'Resume updated successfully',
    data: updatedResume,
  });
}

async function deleteResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeById']>;
  const { resumeId } = request.parsedParams;

  const result = await deleteResumeUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const deleted = result.getValue();

  responseService.success(response, {
    message: 'Resume deleted successfully',
    data: deleted,
  });
}

async function setDefaultResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['setDefaultResume']>;
  const { resumeId } = request.parsedParams;

  const result = await setDefaultResumeUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Default resume updated successfully',
    data: result.getValue(),
  });
}

const resumeController = {
  getResumes,
  getResumesList,
  getResumeById,
  getResumeSnapshots,
  getResumeExports,
  getFailedExports,
  getFailedExportEmailJobs,
  getExportStatus,
  retryFailedExport,
  retryFailedExportEmailJob,
  exportResume,
  enqueueExport,
  getResumeExportStatus,
  createResume,
  updateResume,
  deleteResume,
  setDefaultResume,
};

export default resumeController;
