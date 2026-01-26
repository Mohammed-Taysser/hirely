import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import planService from './plan.service';
import { getPlansFilter } from './plan.utils';
import type { PlanDTO } from './plan.dto';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';

async function getPlans(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlans']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getPlansFilter(request);

  const [plans, count] = await planService.getPaginatedPlans(page, limit, filters);

  responseService.paginated(response, {
    message: 'Plans fetched successfully',
    data: plans,
    metadata: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function getPlanById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlanById']>;
  const { planId } = request.parsedParams;

  const plan = await planService.getPlanById(planId);

  if (!plan) {
    throw errorService.notFound('Plan not found');
  }

  responseService.success(response, {
    message: 'Plan fetched successfully',
    data: plan,
  });
}

async function createPlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['createPlan']>;
  const body = request.parsedBody;

  const existing = await planService.getPlanByCode(body.code);
  if (existing) {
    throw errorService.conflict('Plan code already exists');
  }

  const plan = await planService.createPlan({
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

  const existing = await planService.getPlanById(planId);
  if (!existing) {
    throw errorService.notFound('Plan not found');
  }

  const plan = await planService.updatePlan(planId, {
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
  });

  responseService.success(response, {
    message: 'Plan updated successfully',
    data: plan,
  });
}

async function deletePlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<PlanDTO['getPlanById']>;
  const { planId } = request.parsedParams;

  const existing = await planService.getPlanById(planId);
  if (!existing) {
    throw errorService.notFound('Plan not found');
  }

  const plan = await planService.deletePlan(planId);

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
