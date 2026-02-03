import { Router } from 'express';

import resumeTemplateController from './resumeTemplate.controller';
import resumeTemplateDTO from './resumeTemplate.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const resumeTemplateRoutes = Router();

resumeTemplateRoutes.get(
  '/',
  authenticateMiddleware,
  validateRequest(resumeTemplateDTO.listResumeTemplates),
  resumeTemplateController.getResumeTemplates
);

export default resumeTemplateRoutes;

