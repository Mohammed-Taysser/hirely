import { SwitchUserRequestDto, SwitchUserResponseDto } from './switch-user.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { ITokenService } from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type SwitchUserResponse = Result<SwitchUserResponseDto, NotFoundError | UnexpectedError>;

export class SwitchUserUseCase implements UseCase<SwitchUserRequestDto, SwitchUserResponse> {
  constructor(
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly tokenService: ITokenService
  ) {}

  public async execute(request: SwitchUserRequestDto): Promise<SwitchUserResponse> {
    try {
      const user = await this.userQueryRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      const payload = { id: user.id, email: user.email };
      const accessToken = this.tokenService.signAccessToken(payload);
      const refreshToken = this.tokenService.signRefreshToken(payload);

      const fullUser = await this.userQueryRepository.findById(user.id);
      if (!fullUser) {
        return Result.fail(new NotFoundError('User not found'));
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
