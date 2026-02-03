import { SwitchUserRequestDto, SwitchUserResponseDto } from './switch-user.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { ITokenService } from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

type SwitchUserResponse = Result<SwitchUserResponseDto, NotFoundError | UnexpectedError>;

export class SwitchUserUseCase implements UseCase<SwitchUserRequestDto, SwitchUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(request: SwitchUserRequestDto): Promise<SwitchUserResponse> {
    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      const payload = { id: user.id, email: user.email.value };
      const accessToken = this.tokenService.signAccessToken(payload);
      const refreshToken = this.tokenService.signRefreshToken(payload);

      return Result.ok({
        user: {
          id: user.id,
          name: user.name.value,
          email: user.email.value,
          planId: user.planId,
        },
        accessToken,
        refreshToken,
      });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
