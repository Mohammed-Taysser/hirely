import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface RegisterUserRequestDto {
  email: string;
  name: string;
  password: string;
}

export interface RegisterUserResponseDto {
  user: UserFullDto;
  accessToken: string;
  refreshToken: string;
}
