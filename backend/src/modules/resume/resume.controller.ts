import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { exportService } from '../export/export.service';

import type { ResumeDTO } from './resume.dto';
import resumeService from './resume.service';
import { getResumeExportsFilter, getResumesFilter, getResumeSnapshotsFilter } from './resume.utils';

import { exportResumeCommand } from '@/commands/exportResume.command';
import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { FindResumeByIdUseCase } from '@/modules/resume/application/use-cases/find-resume-by-id/find-resume-by-id.use-case';
import { CreateResumeUseCase } from '@/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { UpdateResumeUseCase } from '@/modules/resume/application/use-cases/update-resume/update-resume.use-case';
import { DeleteResumeUseCase } from '@/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import { PrismaResumeRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.repository';
import { ResumeDtoMapper } from '@/modules/resume/application/mappers/resume.dto.mapper';
import { NotFoundError, ValidationError } from '@/modules/shared/application/app-error';

const resumeRepository = new PrismaResumeRepository();
const findResumeByIdUseCase = new FindResumeByIdUseCase(resumeRepository);
const createResumeUseCase = new CreateResumeUseCase(resumeRepository);
const updateResumeUseCase = new UpdateResumeUseCase(resumeRepository);
const deleteResumeUseCase = new DeleteResumeUseCase(resumeRepository);

async function getResumes(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumesList']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getResumesFilter(request);

  const [resumes, count] = await resumeService.getPaginatedResumes(page, limit, filters);

  responseService.paginated(response, {
    message: 'Resumes fetched successfully',
    data: resumes,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function getResumesList(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumesList']>;
  const filters = getResumesFilter(request);

  const resumes = await resumeService.getBasicResumes(filters);

  responseService.success(response, {
    message: 'Resumes fetched successfully',
    data: resumes,
  });
}

async function getResumeById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeById']>;
  const { resumeId } = request.parsedParams;

  const result = await findResumeByIdUseCase.execute({
    resumeId,
    userId: request.user.id,
  });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    throw errorService.internal();
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

  const [snapshots, count] = await resumeService.getPaginatedSnapshots(page, limit, filters);

  responseService.paginated(response, {
    message: 'Resume snapshots fetched successfully',
    data: snapshots,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function getResumeExports(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeExports']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getResumeExportsFilter(request);

  const [exports, count] = await resumeService.getPaginatedExports(page, limit, filters);

  responseService.paginated(response, {
    message: 'Resume exports fetched successfully',
    data: exports,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function exportResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['exportResume']>;
  const { resumeId } = request.parsedParams;

  const result = await exportService.generatePdfBuffer(request.user.id, resumeId);

  response.setHeader('Content-Type', 'application/pdf');
  response.setHeader('Content-Disposition', `attachment; filename="resume-${resumeId}.pdf"`);
  response.status(200).send(result.pdfBuffer);
}

async function enqueueExport(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['enqueueExport']>;
  const { resumeId } = request.parsedParams;
  const { store } = request.parsedBody;

  if (!store) {
    throw errorService.badRequest('Use /resumes/:resumeId/export/download for direct download');
  }

  const result = await exportResumeCommand(request.user, resumeId);

  responseService.success(response, {
    message: 'Export started',
    data: result,
  });
}

async function getResumeExportStatus(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['getResumeExportStatus']>;
  const { resumeId, exportId } = request.parsedParams;

  const status = await exportService.getExportStatusForResume(request.user.id, resumeId, exportId);

  responseService.success(response, {
    message: 'Export status fetched successfully',
    data: status,
  });
}

async function createResume(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<ResumeDTO['createResume']>;
  const body = request.parsedBody;

  const planLimit = await resumeService.getPlanLimit(request.user.planId);

  if (!planLimit) {
    throw errorService.internal('Plan limits are not configured');
  }

  const currentCount = await resumeService.countUserResumes(request.user.id);

  if (currentCount >= planLimit.maxResumes) {
    throw errorService.forbidden('Resume limit reached for your plan');
  }

  const result = await createResumeUseCase.execute({
    userId: request.user.id,
    name: body.name,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
    data: body.data,
  });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof ValidationError) {
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
  }

  const resume = ResumeDtoMapper.toResponse(result.getValue());

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
    data: body.data,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
  });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    if (error instanceof ValidationError) {
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
  }

  const updatedResume = result.getValue();

  const snapshot = await resumeService.createSnapshot(request.user.id, resumeId);

  if (!snapshot) {
    throw errorService.notFound('Resume snapshot not found');
  }

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
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    throw errorService.internal();
  }

  const deleted = result.getValue();

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
