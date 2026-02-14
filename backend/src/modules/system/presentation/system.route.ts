import { Router } from 'express';

import { getExportOpsMetrics, getHealthCheck } from './system.controller';
import systemDTO from './system.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const systemRoutes = Router();

systemRoutes.get('/health', getHealthCheck);
systemRoutes.get(
  '/metrics/export-ops',
  authenticateMiddleware,
  validateRequest(systemDTO.getExportOpsMetrics),
  getExportOpsMetrics
);

export default systemRoutes;
