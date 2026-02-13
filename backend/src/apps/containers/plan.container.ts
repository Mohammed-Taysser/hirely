import {
  auditLogService,
  planCommandRepository,
  planQueryRepository,
  systemLogService,
} from '@/apps/container.shared';
import { CreatePlanUseCase } from '@/modules/plan/application/use-cases/create-plan/create-plan.use-case';
import { DeletePlanUseCase } from '@/modules/plan/application/use-cases/delete-plan/delete-plan.use-case';
import { GetPlanByIdUseCase } from '@/modules/plan/application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import { GetPlansUseCase } from '@/modules/plan/application/use-cases/get-plans/get-plans.use-case';
import { UpdatePlanUseCase } from '@/modules/plan/application/use-cases/update-plan/update-plan.use-case';

const getPlansUseCase = new GetPlansUseCase(planQueryRepository);
const getPlanByIdUseCase = new GetPlanByIdUseCase(planQueryRepository);
const createPlanUseCase = new CreatePlanUseCase(
  planCommandRepository,
  planQueryRepository,
  systemLogService,
  auditLogService
);
const updatePlanUseCase = new UpdatePlanUseCase(
  planCommandRepository,
  planQueryRepository,
  systemLogService,
  auditLogService
);
const deletePlanUseCase = new DeletePlanUseCase(
  planCommandRepository,
  planQueryRepository,
  systemLogService,
  auditLogService
);

const planContainer = {
  getPlansUseCase,
  getPlanByIdUseCase,
  createPlanUseCase,
  updatePlanUseCase,
  deletePlanUseCase,
};

export { planContainer };
