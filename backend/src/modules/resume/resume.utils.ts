import dateService from '../shared/services/date.service';
import { TypedAuthenticatedRequest } from '../shared/types/import';

import { ResumeDTO } from './resume.dto';
import {
  ResumeQueryFilters,
  ResumeSnapshotsQueryFilters,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { ResumeExportQueryFilters } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';

function getResumesFilter(request: TypedAuthenticatedRequest<ResumeDTO['getResumesList']>) {
  const filters: ResumeQueryFilters = {
    userId: request.user.id,
  };

  const query = request.parsedQuery;

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

function getResumeSnapshotsFilter(
  request: TypedAuthenticatedRequest<ResumeDTO['getResumeSnapshots']>
) {
  const filters: ResumeSnapshotsQueryFilters = {
    userId: request.user.id,
    resumeId: request.parsedParams.resumeId,
  };
  const query = request.parsedQuery;

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

function getResumeExportsFilter(request: TypedAuthenticatedRequest<ResumeDTO['getResumeExports']>) {
  const filters: ResumeExportQueryFilters = {
    userId: request.user.id,
    resumeId: request.parsedParams.resumeId,
  };
  const query = request.parsedQuery;

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  if (query.status) {
    filters.status = query.status;
  }

  return filters;
}

export { getResumesFilter, getResumeSnapshotsFilter, getResumeExportsFilter };
