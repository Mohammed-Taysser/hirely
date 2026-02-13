import { Router } from 'express';

import controller from './audit.controller';
import auditDTO from './audit.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const auditRoutes = Router();

auditRoutes.get(
  '/',
  authenticateMiddleware,
  validateRequest(auditDTO.getAuditLogs),
  controller.getAuditLogs
);

export default auditRoutes;
