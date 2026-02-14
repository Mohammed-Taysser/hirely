import type { AuthenticatedUser } from '@/modules/shared/application/authenticated-user';

export interface EnqueueResumeExportRequestDto {
  user: AuthenticatedUser;
  resumeId: string;
  idempotencyKey?: string;
}

export interface EnqueueResumeExportResponseDto {
  exportId: string;
  delivery: 'download' | 'email';
}
