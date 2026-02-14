import { ResumeFullDto } from '../../repositories/resume.query.repository.interface';

export interface SetDefaultResumeRequestDto {
  resumeId: string;
  userId: string;
}

export type SetDefaultResumeResponseDto = ResumeFullDto;
