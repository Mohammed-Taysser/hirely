import { Router } from 'express';

import controller from './export.controller';
import exportDTO from './export.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const exportRoutes = Router();

exportRoutes.get(
  '/:exportId/status',
  authenticateMiddleware,
  validateRequest(exportDTO.exportStatus),
  controller.getExportStatus
);

export default exportRoutes;
