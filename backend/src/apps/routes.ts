import express from 'express';

import auditRoutes from '@/modules/audit/presentation/audit.route';
import authRoutes from '@/modules/auth/presentation/auth.route';
import planRoutes from '@/modules/plan/presentation/plan.route';
import resumeRoutes from '@/modules/resume/presentation/resume.route';
import resumeTemplateRoutes from '@/modules/resumeTemplate/presentation/resumeTemplate.route';
import systemRoutes from '@/modules/system/presentation/system.route';
import userRoutes from '@/modules/user/presentation/user.route';

const registerApiRoutes = (app: express.Express) => {
  const apiRoutes = express.Router();

  apiRoutes.use('/', systemRoutes);
  apiRoutes.use('/auth', authRoutes);
  apiRoutes.use('/audit-logs', auditRoutes);
  apiRoutes.use('/plans', planRoutes);
  apiRoutes.use('/resume-templates', resumeTemplateRoutes);
  apiRoutes.use('/resumes', resumeRoutes);
  apiRoutes.use('/users', userRoutes);

  app.use('/api', apiRoutes);
};

export { registerApiRoutes };
