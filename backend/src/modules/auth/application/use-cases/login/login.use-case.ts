import { LoginRequestDto, LoginResponseDto } from './login.dto';

import { UnexpectedError, ValidationError } from '@/modules/shared/application/app-error';
import { IPasswordHasher } from '@/modules/shared/application/services/password-hasher.service.interface';
import { ITokenService } from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type LoginResponse = Result<LoginResponseDto, ValidationError | UnexpectedError>;

const isEmailValid = (value: string): boolean => {
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
    return false;
  }

  const domain = value.slice(atIndex + 1);
  if (!domain || domain.startsWith('.') || domain.endsWith('.')) {
    return false;
  }

  return domain.includes('.');
};

export class LoginUseCase implements UseCase<LoginRequestDto, LoginResponse> {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  public async execute(request: LoginRequestDto): Promise<LoginResponse> {
    const email = request.email.trim();
    if (!isEmailValid(email)) {
      return Result.fail(new ValidationError('Email address is invalid'));
    }

    try {
      const user = await this.userQueryRepository.findAuthByEmail(email);

      if (!user) {
        return Result.fail(new ValidationError('Invalid credentials'));
      }

      const passwordValid = await this.passwordHasher.compare(request.password, user.passwordHash);

      if (!passwordValid) {
        return Result.fail(new ValidationError('Invalid credentials'));
      }

      const payload = { id: user.id, email: user.email };
      const accessToken = this.tokenService.signAccessToken(payload);
      const refreshToken = this.tokenService.signRefreshToken(payload);

      const fullUser = await this.userQueryRepository.findById(user.id);
      if (!fullUser) {
        return Result.fail(new UnexpectedError(new Error('User not found')));
      }

      return Result.ok({
        user: fullUser,
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
