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

  const resume = await resumeService.findResumeById(resumeId, request.user.id);

  if (!resume) {
    throw errorService.notFound('Resume not found');
  }

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

  const resume = await resumeService.createResume({
    data: body.data,
    name: body.name,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
    user: { connect: { id: request.user.id } },
  });

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

  const existing = await resumeService.findResumeById(resumeId, request.user.id);

  if (!existing) {
    throw errorService.notFound('Resume not found');
  }

  if (existing.userId !== request.user.id) {
    throw errorService.forbidden('You do not have permission to update this resume');
  }

  const updatedResume = await resumeService.updateResume(resumeId, {
    data: body.data,
    templateId: body.templateId,
    templateVersion: body.templateVersion,
    themeConfig: body.themeConfig,
  });

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

  const existing = await resumeService.findResumeById(resumeId, request.user.id);

  if (!existing) {
    throw errorService.notFound('Resume not found');
  }

  if (existing.userId !== request.user.id) {
    throw errorService.forbidden('You do not have permission to delete this resume');
  }

  const deleted = await resumeService.deleteResumeById(resumeId);

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
