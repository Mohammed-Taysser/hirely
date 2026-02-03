import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { AuthDTO } from './auth.dto';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import tokenService from '@/modules/shared/services/token.service';
import { TypedRequest } from '@/modules/shared/types/import';
import { GetPlanByCodeUseCase } from '@/modules/plan/application/use-cases/get-plan-by-code/get-plan-by-code.use-case';
import { PrismaPlanQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.query.repository';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token/refresh-token.use-case';
import { SwitchUserUseCase } from '@/modules/auth/application/use-cases/switch-user/switch-user.use-case';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user/register-user.use-case';
import { PrismaUserRepository } from '@/modules/user/infrastructure/persistence/prisma-user.repository';
import { NotFoundError } from '@/modules/shared/application/app-error';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';
import { PrismaUserQueryRepository } from '@/modules/user/infrastructure/persistence/prisma-user.query.repository';
import { GetUserByIdQueryUseCase } from '@/modules/user/application/use-cases/get-user-by-id-query/get-user-by-id-query.use-case';
import passwordHasherService from '@/modules/shared/services/password-hasher.service';

const userRepository = new PrismaUserRepository();
const userQueryRepository = new PrismaUserQueryRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasherService);
const loginUseCase = new LoginUseCase(userRepository, tokenService, passwordHasherService);
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService);
const switchUserUseCase = new SwitchUserUseCase(userRepository, tokenService);
const getUserByIdQueryUseCase = new GetUserByIdQueryUseCase(userQueryRepository);
const planQueryRepository = new PrismaPlanQueryRepository();
const getPlanByCodeUseCase = new GetPlanByCodeUseCase(planQueryRepository);

async function register(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['register']>;
  const data = request.parsedBody;

  const planResult = await getPlanByCodeUseCase.execute({ code: 'FREE' });

  if (planResult.isFailure) {
    throw mapAppErrorToHttp(planResult.error);
  }

  const plan = planResult.getValue();

  const result = await registerUserUseCase.execute({
    email: data.email,
    name: data.name,
    password: data.password,
    planId: plan.id,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  const userResult = await getUserByIdQueryUseCase.execute({ userId: result.getValue().id });

  if (userResult.isFailure) {
    throw mapAppErrorToHttp(userResult.error);
  }

  const user = userResult.getValue();
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
    throw mapAppErrorToHttp(result.error);
  }

  const payload = result.getValue();
  const userResult = await getUserByIdQueryUseCase.execute({ userId: payload.user.id });

  if (userResult.isFailure) {
    throw mapAppErrorToHttp(userResult.error);
  }

  const user = userResult.getValue();

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
    throw mapAppErrorToHttp(error);
  }

  const payload = result.getValue();
  const userResult = await getUserByIdQueryUseCase.execute({ userId: payload.user.id });

  if (userResult.isFailure) {
    throw mapAppErrorToHttp(userResult.error);
  }

  const user = userResult.getValue();

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
