import { PlanDto } from '@/modules/plan/application/repositories/plan.query.repository.interface';
import {
  CreatePlanRequestDto,
  UpdatePlanDataDto,
} from '@/modules/plan/application/dto/plan-command.dto';

export interface IPlanCommandRepository {
  create(data: CreatePlanRequestDto): Promise<PlanDto>;
  update(id: string, data: UpdatePlanDataDto): Promise<PlanDto>;
  delete(id: string): Promise<PlanDto>;
}
