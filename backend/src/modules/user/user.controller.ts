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
import { GetPlanByCodeUseCase } from '@/modules/plan/application/use-cases/get-plan-by-code/get-plan-by-code.use-case';
import { PrismaPlanQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.query.repository';
import { GetUserByIdQueryUseCase } from '@/modules/user/application/use-cases/get-user-by-id-query/get-user-by-id-query.use-case';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';
import passwordHasherService from '@/modules/shared/services/password-hasher.service';

const userRepository = new PrismaUserRepository();
const userQueryRepository = new PrismaUserQueryRepository();
const planQueryRepository = new PrismaPlanQueryRepository();
const getPlanByCodeUseCase = new GetPlanByCodeUseCase(planQueryRepository);
const getUsersUseCase = new GetUsersUseCase(userQueryRepository);
const getUsersListUseCase = new GetUsersListUseCase(userQueryRepository);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasherService);
const getUserByIdQueryUseCase = new GetUserByIdQueryUseCase(userQueryRepository);

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
    throw mapAppErrorToHttp(result.error);
  }

  const userResult = await getUserByIdQueryUseCase.execute({ userId: result.getValue().id });

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

  const planResult = await getPlanByCodeUseCase.execute({ code: 'FREE' });

  if (planResult.isFailure) {
    throw mapAppErrorToHttp(planResult.error);
  }

  const plan = planResult.getValue();

  const result = await registerUserUseCase.execute({
    email: body.email,
    name: body.name,
    password: body.password,
    planId: plan.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const newUserResult = await getUserByIdQueryUseCase.execute({ userId: result.getValue().id });

  if (newUserResult.isFailure) {
    throw mapAppErrorToHttp(newUserResult.error);
  }

  const newUser = newUserResult.getValue();

  responseService.success(response, {
    message: 'User created successfully',
    data: newUser,
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

  const updatedUserResult = await getUserByIdQueryUseCase.execute({ userId: result.getValue().id });

  if (updatedUserResult.isFailure) {
    throw mapAppErrorToHttp(updatedUserResult.error);
  }

  const updatedUser = updatedUserResult.getValue();

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

  const existingUserResult = await getUserByIdQueryUseCase.execute({ userId: params.userId });

  if (existingUserResult.isFailure) {
    throw mapAppErrorToHttp(existingUserResult.error);
  }

  const existingUser = existingUserResult.getValue();

  const result = await deleteUserUseCase.execute({ userId: params.userId });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const deletedUser = existingUser;

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
