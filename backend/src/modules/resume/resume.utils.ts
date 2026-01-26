import { Prisma } from '@generated-prisma';

import dateService from '../shared/services/date.service';
import { TypedAuthenticatedRequest } from '../shared/types/import';

import { ResumeDTO } from './resume.dto';

function getResumesFilter(request: TypedAuthenticatedRequest<ResumeDTO['getResumesList']>) {
  const filters: Prisma.ResumeWhereInput = {};

  const query = request.parsedQuery;

  filters.userId = request.user.id;

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

function getResumeSnapshotsFilter(
  request: TypedAuthenticatedRequest<ResumeDTO['getResumeSnapshots']>
) {
  const filters: Prisma.ResumeSnapshotWhereInput = {};
  const query = request.parsedQuery;

  filters.userId = request.user.id;
  filters.resumeId = request.parsedParams.resumeId;

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

function getResumeExportsFilter(request: TypedAuthenticatedRequest<ResumeDTO['getResumeExports']>) {
  const filters: Prisma.ResumeExportWhereInput = {};
  const query = request.parsedQuery;

  filters.userId = request.user.id;
  filters.snapshot = { resumeId: request.parsedParams.resumeId };

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  if (query.status) {
    filters.status = query.status;
  }

  return filters;
}

export { getResumesFilter, getResumeSnapshotsFilter, getResumeExportsFilter };
