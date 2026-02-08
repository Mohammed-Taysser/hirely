import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { UserDTO } from './user.dto';
import { getUsersFilter } from './user.utils';

import { userContainer } from '@/apps/container';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { UserProfileDto } from '@/modules/user/application/user-profile.dto';

const {
  getUsersUseCase,
  getUsersListUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  changeUserPlanUseCase,
  getUserByIdQueryUseCase,
  createUserWithPlanUseCase,
} = userContainer;

async function getUsers(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUsersList']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getUsersFilter(request);

  const result = await getUsersUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const { users, total } = result.getValue();

  responseService.paginated(response, {
    message: 'Users fetched successfully',
    data: users,
    metadata: {
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function getUsersList(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUsersList']>;

  const filters = getUsersFilter(request);

  const result = await getUsersListUseCase.execute({ filters });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const users = result.getValue();

  responseService.success(response, {
    message: 'Users fetched successfully',
    data: users,
  });
}

async function getProfile(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest;

  const user: UserProfileDto = {
    id: request.user.id,
    name: request.user.name,
    email: request.user.email,
    planId: request.user.planId,
    isVerified: Boolean(request.user.isVerified),
  };

  responseService.success(response, {
    message: 'User fetched successfully',
    data: user,
  });
}

async function getUserById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUserById']>;

  const { params } = request;

  const userResult = await getUserByIdQueryUseCase.execute({ userId: params.userId });

  if (userResult.isFailure) {
    throw mapAppErrorToHttp(userResult.error);
  }

  const user = userResult.getValue();

  responseService.success(response, {
    message: 'User fetched successfully',
    data: user,
  });
}

async function createUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['createUser']>;

  const body = request.parsedBody;

  const result = await createUserWithPlanUseCase.execute({
    email: body.email,
    name: body.name,
    password: body.password,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'User created successfully',
    data: result.getValue(),
    statusCode: StatusCodes.CREATED,
  });
}

async function updateUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['updateUser']>;

  const { parsedBody: body, parsedParams: params, user: authUser } = request;

  if (params.userId !== authUser.id) {
    throw errorService.forbidden('You do not have permission to update this user');
  }

  const result = await updateUserUseCase.execute({
    userId: params.userId,
    name: body.name,
    email: body.email,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const updatedUser = result.getValue();

  responseService.success(response, {
    message: 'User updated successfully',
    data: updatedUser,
  });
}

async function deleteUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUserById']>;

  const { parsedParams: params, user } = request;

  if (params.userId !== user.id) {
    throw errorService.forbidden('You do not have permission to delete this user');
  }

  const result = await deleteUserUseCase.execute({ userId: params.userId });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const deletedUser = result.getValue();

  responseService.success(response, {
    message: 'User deleted successfully',
    data: deletedUser,
  });
}

async function changeUserPlan(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['changeUserPlan']>;

  const { parsedParams: params, parsedBody: body, user: authUser } = request;

  if (params.userId !== authUser.id) {
    throw errorService.forbidden('You do not have permission to change this user plan');
  }

  const result = await changeUserPlanUseCase.execute({
    userId: params.userId,
    planCode: body.planCode,
    scheduleAt: body.scheduleAt,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'Plan updated successfully',
    data: result.getValue(),
  });
}

const userController = {
  getUsers,
  getUsersList,
  getProfile,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserPlan,
};

export default userController;
