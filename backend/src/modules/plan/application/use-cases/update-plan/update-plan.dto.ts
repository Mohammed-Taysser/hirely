import { UpdatePlanDataDto } from '@/modules/plan/application/dto/plan-command.dto';

export interface UpdatePlanRequestDto {
  planId: string;
  data: UpdatePlanDataDto;
}

export type { UpdatePlanDataDto } from '@/modules/plan/application/dto/plan-command.dto';
