import { Router } from 'express';

import controller from './user.controller';
import userDTO from './user.dto';

import authenticateMiddleware from '@/middleware/authenticate.middleware';
import validateRequest from '@/middleware/validate-request.middleware';

const userRoutes = Router();

userRoutes.get('/me', authenticateMiddleware, controller.getProfile);

userRoutes.get(
  '/basic',
  authenticateMiddleware,
  validateRequest(userDTO.getUsersList),
  controller.getUsersList
);
userRoutes.get('/', validateRequest(userDTO.getUsersList), controller.getUsers);

userRoutes.get('/:userId', validateRequest(userDTO.getUserById), controller.getUserById);

userRoutes.post(
  '/',
  authenticateMiddleware,
  validateRequest(userDTO.createUser),
  controller.createUser
);

userRoutes.patch(
  '/:userId',
  authenticateMiddleware,
  validateRequest(userDTO.updateUser),
  controller.updateUser
);
userRoutes.patch(
  '/:userId/plan',
  authenticateMiddleware,
  validateRequest(userDTO.changeUserPlan),
  controller.changeUserPlan
);
userRoutes.delete(
  '/:userId',
  authenticateMiddleware,
  validateRequest(userDTO.getUserById),
  controller.deleteUser
);

export default userRoutes;
