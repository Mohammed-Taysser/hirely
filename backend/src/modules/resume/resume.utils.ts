import { Prisma } from '@generated-prisma';
import { ResumeData, ResumeSection } from '@hirely/resume-core';

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

type ResumeDataInput = {
  meta: {
    title: string;
    language?: string | null;
  };
  sections: Record<
    string,
    {
      type: 'summary' | 'experience';
      content: {
        text?: string;
        company?: string;
        role?: string;
        startDate?: string | Date | null;
        endDate?: string | Date | null;
      };
    }
  >;
};

const toIsoString = (value?: string | Date | null) => {
  if (!value) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
};

const normalizeResumeSection = (
  section: ResumeDataInput['sections'][string]
): ResumeSection => {
  if (section.type === 'summary') {
    return {
      type: 'summary',
      content: {
        text: section.content.text ?? '',
      },
    };
  }

  return {
    type: 'experience',
    content: {
      company: section.content.company ?? '',
      role: section.content.role ?? '',
      startDate: toIsoString(section.content.startDate),
      endDate: toIsoString(section.content.endDate),
    },
  };
};

const normalizeResumeData = (data: ResumeDataInput): ResumeData => {
  const normalizedSections: Record<string, ResumeSection> = {};

  for (const [key, section] of Object.entries(data.sections)) {
    normalizedSections[key] = normalizeResumeSection(section);
  }

  return {
    meta: {
      title: data.meta.title,
      language: data.meta.language ?? null,
    },
    sections: normalizedSections,
  };
};

export { getResumesFilter, getResumeSnapshotsFilter, getResumeExportsFilter, normalizeResumeData };
