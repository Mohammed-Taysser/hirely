import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { AuthDTO } from './auth.dto';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import tokenService from '@/modules/shared/services/token.service';
import { TypedRequest } from '@/modules/shared/types/import';
import planService from '@/modules/plan/plan.service';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token/refresh-token.use-case';
import { SwitchUserUseCase } from '@/modules/auth/application/use-cases/switch-user/switch-user.use-case';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user/register-user.use-case';
import { PrismaUserRepository } from '@/modules/user/infrastructure/persistence/prisma-user.repository';
import { ValidationError, NotFoundError } from '@/modules/shared/application/app-error';
import userService from '@/modules/user/user.service';

const userRepository = new PrismaUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository, tokenService);
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService);
const switchUserUseCase = new SwitchUserUseCase(userRepository, tokenService);

async function register(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['register']>;
  const data = request.parsedBody;

  const plan = await planService.getPlanByCode('FREE');

  if (!plan) {
    throw errorService.internal('Default plan not configured');
  }

  const result = await registerUserUseCase.execute({
    email: data.email,
    name: data.name,
    password: data.password,
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

  const user = await userService.findUserById(result.getValue().id);

  if (!user) {
    throw errorService.internal('Failed to load created user');
  }

  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = tokenService.signRefreshToken(user);

  responseService.success(response, {
    message: 'User registered successfully',
    data: { accessToken, refreshToken, user },
    statusCode: StatusCodes.CREATED,
  });
}

async function login(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['login']>;
  const data = request.parsedBody;

  const result = await loginUseCase.execute({ email: data.email, password: data.password });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof ValidationError) {
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
  }

  const payload = result.getValue();
  const user = await userService.findUserById(payload.user.id);

  if (!user) {
    throw errorService.internal('Failed to load user');
  }

  responseService.success(response, {
    message: 'Login successful',
    data: {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user,
    },
  });
}

async function refreshToken(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['refreshToken']>;
  const { refreshToken } = request.parsedBody;

  const result = await refreshTokenUseCase.execute({ refreshToken });

  if (result.isFailure) {
    throw errorService.unauthorized('Invalid Or Expired Refresh Token');
  }

  responseService.success(response, {
    message: 'New access token issued',
    data: result.getValue(),
  });
}

async function switchUser(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['switchUser']>;
  const { userId } = request.parsedBody;

  const result = await switchUserUseCase.execute({ userId });

  if (result.isFailure) {
    const error = result.error;
    if (error instanceof NotFoundError) {
      throw errorService.badRequest(error.message);
    }
    throw errorService.internal();
  }

  const payload = result.getValue();
  const user = await userService.findUserById(payload.user.id);

  if (!user) {
    throw errorService.internal('Failed to load user');
  }

  responseService.success(response, {
    message: 'Switched user successfully',
    data: {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user,
    },
  });
}

const authController = {
  login,
  refreshToken,
  register,
  switchUser,
};

export default authController;
