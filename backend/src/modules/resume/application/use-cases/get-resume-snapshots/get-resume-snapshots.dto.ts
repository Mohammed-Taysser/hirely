import {
  ResumeSnapshotDto,
  ResumeSnapshotsQueryFilters,
} from '../../repositories/resume.query.repository.interface';

export interface GetResumeSnapshotsRequestDto {
  page: number;
  limit: number;
  filters: ResumeSnapshotsQueryFilters;
}

export interface GetResumeSnapshotsResponseDto {
  snapshots: ResumeSnapshotDto[];
  total: number;
}
