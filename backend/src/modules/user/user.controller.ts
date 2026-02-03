import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { UserDTO } from './user.dto';
import { getUsersFilter } from './user.utils';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';
import { GetUsersUseCase } from '@/modules/user/application/use-cases/get-users/get-users.use-case';
import { GetUsersListUseCase } from '@/modules/user/application/use-cases/get-users-list/get-users-list.use-case';
import { FindUserByIdUseCase } from '@/modules/user/application/use-cases/find-user-by-id/find-user-by-id.use-case';
import { UpdateUserUseCase } from '@/modules/user/application/use-cases/update-user/update-user.use-case';
import { DeleteUserUseCase } from '@/modules/user/application/use-cases/delete-user/delete-user.use-case';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user/register-user.use-case';
import { PrismaUserRepository } from '@/modules/user/infrastructure/persistence/prisma-user.repository';
import { PrismaUserQueryRepository } from '@/modules/user/infrastructure/persistence/prisma-user.query.repository';
import planService from '@/modules/plan/plan.service';
import { NotFoundError, ValidationError } from '@/modules/shared/application/app-error';

const userRepository = new PrismaUserRepository();
const userQueryRepository = new PrismaUserQueryRepository();
const getUsersUseCase = new GetUsersUseCase(userQueryRepository);
const getUsersListUseCase = new GetUsersListUseCase(userQueryRepository);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const registerUserUseCase = new RegisterUserUseCase(userRepository);

async function getUsers(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUsersList']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getUsersFilter(request);

  const result = await getUsersUseCase.execute({ page, limit, filters });

  if (result.isFailure) {
    throw errorService.internal();
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
    throw errorService.internal();
  }

  const users = result.getValue();

  responseService.success(response, {
    message: 'Users fetched successfully',
    data: users,
  });
}

async function getProfile(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = request.user;

  responseService.success(response, {
    message: 'User fetched successfully',
    data: user,
  });
}

async function getUserById(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUserById']>;

  const { params } = request;

  const result = await findUserByIdUseCase.execute({ userId: params.userId });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    throw errorService.internal();
  }

  const user = result.getValue();

  responseService.success(response, {
    message: 'User fetched successfully',
    data: user,
  });
}

async function createUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['createUser']>;

  const body = request.parsedBody;

  const plan = await planService.getPlanByCode('FREE');

  if (!plan) {
    throw errorService.internal('Default plan not configured');
  }

  const result = await registerUserUseCase.execute({
    email: body.email,
    name: body.name,
    password: body.password,
    planId: plan.id,
  });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof ValidationError) {
      if (error.message.includes('exists')) {
        throw errorService.conflict(error.message);
      }
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
  }

  const newUser = result.getValue();

  responseService.success(response, {
    message: 'User created successfully',
    data: newUser,
    statusCode: StatusCodes.CREATED,
  });
}

async function updateUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['updateUser']>;

  const { parsedBody: body, parsedParams: params, user: authUser } = request;

  const user = await userService.findUserById(params.userId);

  if (!user) {
    throw errorService.notFound('User not found');
  }

  if (params.userId !== authUser.id) {
    throw errorService.forbidden('You do not have permission to update this user');
  }

  const result = await updateUserUseCase.execute({
    userId: params.userId,
    name: body.name,
    email: body.email,
  });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    if (error instanceof ValidationError) {
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
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
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.notFound(error.message);
    }
    throw errorService.internal();
  }

  const deletedUser = result.getValue();

  responseService.success(response, {
    message: 'User deleted successfully',
    data: deletedUser,
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
};

export default userController;
