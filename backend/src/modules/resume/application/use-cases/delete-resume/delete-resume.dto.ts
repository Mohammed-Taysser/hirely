export interface DeleteResumeRequestDto {
  resumeId: string;
  userId: string;
}

import { ResumeFullDto } from '@/modules/resume/application/repositories/resume.query.repository.interface';

export type DeleteResumeResponseDto = ResumeFullDto;
