import type { User } from '@generated-prisma';

export interface EnqueueResumeExportRequestDto {
  user: User;
  resumeId: string;
}

export interface EnqueueResumeExportResponseDto {
  exportId: string;
  delivery: 'download' | 'email';
}
