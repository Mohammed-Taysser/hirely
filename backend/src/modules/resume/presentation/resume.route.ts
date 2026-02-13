import { Router } from 'express';

import controller from './resume.controller';
import resumeDTO from './resume.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const resumeRoutes = Router();

resumeRoutes.get(
  '/basic',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumesList),
  controller.getResumesList
);

resumeRoutes.get(
  '/',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumesList),
  controller.getResumes
);

resumeRoutes.get(
  '/:resumeId',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumeById),
  controller.getResumeById
);

resumeRoutes.get(
  '/:resumeId/snapshots',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumeSnapshots),
  controller.getResumeSnapshots
);

resumeRoutes.get(
  '/:resumeId/exports',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumeExports),
  controller.getResumeExports
);

resumeRoutes.get(
  '/exports/:exportId/status',
  authenticateMiddleware,
  validateRequest(resumeDTO.exportStatus),
  controller.getExportStatus
);

resumeRoutes.get(
  '/:resumeId/export/download',
  authenticateMiddleware,
  validateRequest(resumeDTO.exportResume),
  controller.exportResume
);

resumeRoutes.post(
  '/:resumeId/export',
  authenticateMiddleware,
  validateRequest(resumeDTO.enqueueExport),
  controller.enqueueExport
);

resumeRoutes.get(
  '/:resumeId/exports/:exportId/status',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumeExportStatus),
  controller.getResumeExportStatus
);

resumeRoutes.post(
  '/',
  authenticateMiddleware,
  validateRequest(resumeDTO.createResume),
  controller.createResume
);

resumeRoutes.patch(
  '/:resumeId',
  authenticateMiddleware,
  validateRequest(resumeDTO.updateResume),
  controller.updateResume
);

resumeRoutes.delete(
  '/:resumeId',
  authenticateMiddleware,
  validateRequest(resumeDTO.getResumeById),
  controller.deleteResume
);

export default resumeRoutes;
