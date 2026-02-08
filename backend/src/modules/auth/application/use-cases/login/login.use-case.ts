import { LoginRequestDto, LoginResponseDto } from './login.dto';

import { UnexpectedError, ValidationError } from '@/modules/shared/application/app-error';
import { IPasswordHasher } from '@/modules/shared/application/services/password-hasher.service.interface';
import { ITokenService } from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { UserEmail } from '@/modules/user/domain/value-objects/user-email.vo';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type LoginResponse = Result<LoginResponseDto, ValidationError | UnexpectedError>;

export class LoginUseCase implements UseCase<LoginRequestDto, LoginResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  public async execute(request: LoginRequestDto): Promise<LoginResponse> {
    const emailHelper = UserEmail.create(request.email);

    if (emailHelper.isFailure) {
      return Result.fail(new ValidationError(emailHelper.error as string));
    }

    const email = emailHelper.getValue();

    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return Result.fail(new ValidationError('Invalid credentials'));
      }

      const passwordValid = await this.passwordHasher.compare(
        request.password,
        user.password.value
      );

      if (!passwordValid) {
        return Result.fail(new ValidationError('Invalid credentials'));
      }

      const payload = { id: user.id, email: user.email.value };
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
