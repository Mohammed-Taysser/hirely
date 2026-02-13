import { RegisterUserRequestDto, RegisterUserResponseDto } from './register-user.dto';

import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { ITokenService } from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ICreateUserWithPlanService } from '@/modules/user/application/services/create-user-with-plan.service.interface';

export type RegisterUserResponse = Result<RegisterUserResponseDto, AppError>;

export class RegisterUserUseCase implements UseCase<RegisterUserRequestDto, RegisterUserResponse> {
  constructor(
    private readonly createUserWithPlanUseCase: ICreateUserWithPlanService,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(request: RegisterUserRequestDto): Promise<RegisterUserResponse> {
    const createResult = await this.createUserWithPlanUseCase.execute({
      email: request.email,
      name: request.name,
      password: request.password,
    });

    if (createResult.isFailure) {
      const error = createResult.error ?? new UnexpectedError(new Error('User creation failed'));
      return Result.fail(error);
    }

    try {
      const user = createResult.getValue();
      const payload = { id: user.id, email: user.email };
      const accessToken = this.tokenService.signAccessToken(payload);
      const refreshToken = this.tokenService.signRefreshToken(payload);

      return Result.ok({ user, accessToken, refreshToken });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
