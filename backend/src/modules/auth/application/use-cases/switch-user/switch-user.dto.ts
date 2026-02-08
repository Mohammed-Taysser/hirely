import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface SwitchUserRequestDto {
  userId: string;
}

export interface SwitchUserResponseDto {
  user: UserFullDto;
  accessToken: string;
  refreshToken: string;
}
