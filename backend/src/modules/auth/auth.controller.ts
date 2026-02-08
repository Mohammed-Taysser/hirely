import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { AuthDTO } from './auth.dto';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import { TypedRequest } from '@/modules/shared/types/import';
import { NotFoundError } from '@/modules/shared/application/app-error';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import { authContainer } from '@/apps/container';

const { registerUserUseCase, loginUseCase, refreshTokenUseCase, switchUserUseCase } = authContainer;

async function register(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['register']>;
  const data = request.parsedBody;

  const result = await registerUserUseCase.execute({
    email: data.email,
    name: data.name,
    password: data.password,
  });

  if (result.isFailure) {
    throw mapAppErrorToHttp(result.error);
  }

  responseService.success(response, {
    message: 'User registered successfully',
    data: result.getValue(),
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

  responseService.success(response, {
    message: 'Login successful',
    data: result.getValue(),
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

  responseService.success(response, {
    message: 'Switched user successfully',
    data: result.getValue(),
  });
}

const authController = {
  login,
  refreshToken,
  register,
  switchUser,
};

export default authController;
