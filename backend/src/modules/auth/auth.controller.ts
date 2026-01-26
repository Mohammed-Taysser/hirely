import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { AuthDTO } from './auth.dto';
import authService from './auth.service';

import errorService from '@/modules/shared/services/error.service';
import responseService from '@/modules/shared/services/response.service';
import tokenService from '@/modules/shared/services/token.service';
import { TypedRequest } from '@/modules/shared/types/import';

async function register(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['register']>;
  const data = request.parsedBody;

  const user = await authService.findUserByEmail(data.email);

  if (user) {
    throw errorService.conflict('Email already registered');
  }

  const hashedPassword = await tokenService.hash(data.password);

  const newUser = await authService.createUser({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    plan: { connect: { code: 'FREE' } },
  });

  const accessToken = tokenService.signAccessToken(newUser);
  const refreshToken = tokenService.signRefreshToken(newUser);

  responseService.success(response, {
    message: 'User registered successfully',
    data: { accessToken, refreshToken, user: newUser },
    statusCode: StatusCodes.CREATED,
  });
}

async function login(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['login']>;
  const data = request.parsedBody;

  const user = await authService.findUserByEmail(data.email);

  if (!user) {
    throw errorService.badRequest('Invalid credentials');
  }

  const valid = await tokenService.compare(data.password, user.password);

  if (!valid) {
    throw errorService.badRequest('Invalid credentials');
  }

  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = tokenService.signRefreshToken(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...restUser } = user;

  responseService.success(response, {
    message: 'Login successful',
    data: { accessToken, refreshToken, user: restUser },
  });
}

function refreshToken(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['refreshToken']>;
  const { refreshToken } = request.parsedBody;

  try {
    const payload = tokenService.verifyToken<UserTokenPayload>(refreshToken);

    const newAccessToken = tokenService.signAccessToken(payload);
    const newRefreshToken = tokenService.signRefreshToken(payload);

    responseService.success(response, {
      message: 'New access token issued',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch {
    throw errorService.unauthorized('Invalid Or Expired Refresh Token');
  }
}

async function switchUser(req: Request, response: Response) {
  const request = req as TypedRequest<AuthDTO['switchUser']>;
  const { userId } = request.parsedBody;

  const user = await authService.findUserById(userId);

  if (!user) {
    throw errorService.badRequest('User not found');
  }

  const accessToken = tokenService.signAccessToken(user);
  const refreshToken = tokenService.signRefreshToken(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...restUser } = user;

  responseService.success(response, {
    message: 'Switched user successfully',
    data: { accessToken, refreshToken, user: restUser },
  });
}

const authController = {
  login,
  refreshToken,
  register,
  switchUser,
};

export default authController;
