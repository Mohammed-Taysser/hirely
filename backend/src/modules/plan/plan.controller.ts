import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { getPlansFilter } from './plan.utils';
import type { PlanDTO } from './plan.dto';
import { planContainer } from '@/apps/container';

import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';

const {
  getPlansUseCase,
  getPlanByIdUseCase,
  createPlanUseCase,
  updatePlanUseCase,
  deletePlanUseCase,
} = planContainer;

async function getPlans(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlans']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getPlansFilter(request);

  const result = await getPlansUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { plans, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Plans fetched successfully',
    data: plans,
    metadata: {
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function getPlanById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlanById']>;
  const { planId } = request.parsedParams;

  const result = await getPlanByIdUseCase.execute({ planId });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const plan = result.getValue();

  responseService.success(response, {
    message: 'Plan fetched successfully',
    data: plan,
  });
}

async function createPlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['createPlan']>;
  const body = request.parsedBody;

  const result = await createPlanUseCase.execute({
    code: body.code,
    name: body.name,
    description: body.description,
    limits: {
      create: {
        maxResumes: body.limits.maxResumes,
        maxExports: body.limits.maxExports,
        dailyUploadMb: body.limits.dailyUploadMb,
      },
    },
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const plan = result.getValue();

  responseService.success(response, {
    message: 'Plan created successfully',
    data: plan,
    statusCode: StatusCodes.CREATED,
  });
}

async function updatePlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['updatePlan']>;
  const { planId } = request.parsedParams;
  const body = request.parsedBody;

  const result = await updatePlanUseCase.execute({
    planId,
    data: {
      code: body.code,
      name: body.name,
      description: body.description,
      limits: body.limits
        ? {
            update: {
              maxResumes: body.limits.maxResumes,
              maxExports: body.limits.maxExports,
              dailyUploadMb: body.limits.dailyUploadMb,
            },
          }
        : undefined,
    },
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const plan = result.getValue();

  responseService.success(response, {
    message: 'Plan updated successfully',
    data: plan,
  });
}

async function deletePlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlanById']>;
  const { planId } = request.parsedParams;

  const result = await deletePlanUseCase.execute({ planId });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const plan = result.getValue();

  responseService.success(response, {
    message: 'Plan deleted successfully',
    data: plan,
  });
}

const planController = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};

export default planController;
