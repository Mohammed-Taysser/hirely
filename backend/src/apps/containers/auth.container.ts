import { passwordHasherService, tokenService, userQueryRepository } from '@/apps/container.shared';
import { createUserWithPlanUseCase } from '@/apps/containers/user.container';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token/refresh-token.use-case';
import { RegisterUserUseCase as RegisterAuthUserUseCase } from '@/modules/auth/application/use-cases/register-user/register-user.use-case';
import { SwitchUserUseCase } from '@/modules/auth/application/use-cases/switch-user/switch-user.use-case';

const registerUserUseCase = new RegisterAuthUserUseCase(createUserWithPlanUseCase, tokenService);
const loginUseCase = new LoginUseCase(tokenService, passwordHasherService, userQueryRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService);
const switchUserUseCase = new SwitchUserUseCase(userQueryRepository, tokenService);

const authContainer = {
  registerUserUseCase,
  loginUseCase,
  refreshTokenUseCase,
  switchUserUseCase,
};

export { authContainer };
