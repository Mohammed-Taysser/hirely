export interface DeleteResumeRequestDto {
  resumeId: string;
  userId: string;
}

import { ResumeDto } from '../../resume.dto';

export type DeleteResumeResponseDto = ResumeDto;
