import { Router } from 'express';

import controller from './plan.controller';
import planDTO from './plan.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const planRoutes = Router();

planRoutes.get('/', authenticateMiddleware, validateRequest(planDTO.getPlans), controller.getPlans);

planRoutes.get(
  '/:planId',
  authenticateMiddleware,
  validateRequest(planDTO.getPlanById),
  controller.getPlanById
);

planRoutes.post(
  '/',
  authenticateMiddleware,
  validateRequest(planDTO.createPlan),
  controller.createPlan
);

planRoutes.patch(
  '/:planId',
  authenticateMiddleware,
  validateRequest(planDTO.updatePlan),
  controller.updatePlan
);

planRoutes.delete(
  '/:planId',
  authenticateMiddleware,
  validateRequest(planDTO.getPlanById),
  controller.deletePlan
);

export default planRoutes;
