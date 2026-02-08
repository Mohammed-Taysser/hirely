import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: UserFullDto;
  accessToken: string;
  refreshToken: string;
}
