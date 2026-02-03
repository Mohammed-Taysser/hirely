import { RefreshTokenRequestDto, RefreshTokenResponseDto } from './refresh-token.dto';

import { ValidationError } from '@/modules/shared/application/app-error';
import {
  ITokenService,
  UserTokenPayload,
} from '@/modules/shared/application/services/token.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type RefreshTokenResponse = Result<RefreshTokenResponseDto, ValidationError>;

export class RefreshTokenUseCase
  implements UseCase<RefreshTokenRequestDto, RefreshTokenResponse>
{
  constructor(private readonly tokenService: ITokenService) {}

  public async execute(request: RefreshTokenRequestDto): Promise<RefreshTokenResponse> {
    try {
      const payload = this.tokenService.verifyToken<UserTokenPayload>(request.refreshToken);
      const accessToken = this.tokenService.signAccessToken(payload);
      const refreshToken = this.tokenService.signRefreshToken(payload);

      return Result.ok({ accessToken, refreshToken });
    } catch (err) {
      return Result.fail(new ValidationError('Invalid or expired refresh token'));
    }
  }
}
