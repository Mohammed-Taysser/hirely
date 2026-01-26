import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { UserDTO } from './user.dto';
import userService from './user.service';
import { getUsersFilter } from './user.utils';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import tokenService from '@/modules/shared/services/token.service';
import { TypedAuthenticatedRequest } from '@/modules/shared/types/import';

async function getUsers(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUsersList']>;
  const query = request.parsedQuery;

  const limit = query.limit;
  const page = query.page;

  const filters = getUsersFilter(request);

  const [users, count] = await userService.getPaginatedUsers(page, limit, filters);

  responseService.paginated(response, {
    message: 'Users fetched successfully',
    data: users,
    metadata: {
      total: count,
      page: page,
      limit: limit,
      totalPages: Math.ceil(count / limit),
    },
  });
}

async function getUsersList(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUsersList']>;

  const filters = getUsersFilter(request);

  const users = await userService.getBasicUsers(filters);

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

  const user = await userService.findUserById(params.userId);

  if (!user) {
    throw errorService.notFound('User not found');
  }

  responseService.success(response, {
    message: 'User fetched successfully',
    data: user,
  });
}

async function createUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['createUser']>;

  const body = request.parsedBody;

  const user = await userService.findUserByEmail(body.email);

  if (user) {
    throw errorService.conflict('Email already registered');
  }

  const hashed = await tokenService.hash(body.password);

  const newUser = await userService.createUser({
    ...body,
    password: hashed,
    plan: { connect: { code: 'FREE' } },
  });

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

  const updatedUser = await userService.updateUser(params.userId, body);

  responseService.success(response, {
    message: 'User updated successfully',
    data: updatedUser,
  });
}

async function deleteUser(req: Request, response: Response) {
  const request = req as TypedAuthenticatedRequest<UserDTO['getUserById']>;

  const { parsedParams: params, user } = request;

  const userRecord = await userService.findUserById(params.userId);

  if (!userRecord) {
    throw errorService.notFound('User not found');
  }

  if (params.userId !== user.id) {
    throw errorService.forbidden('You do not have permission to delete this user');
  }

  const deletedUser = await userService.deleteUserById(params.userId);

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
