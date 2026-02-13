import { Router } from 'express';

import controller from './auth.controller';
import authDTO from './auth.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const authRoutes = Router();

authRoutes.post('/register', validateRequest(authDTO.register), controller.register);
authRoutes.post('/login', validateRequest(authDTO.login), controller.login);
authRoutes.post('/refresh-token', validateRequest(authDTO.refreshToken), controller.refreshToken);

authRoutes.post(
  '/switch-user',
  authenticateMiddleware,
  validateRequest(authDTO.switchUser),
  controller.switchUser
);

export default authRoutes;
