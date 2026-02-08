import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface UpdateUserRequestDto {
  userId: string;
  name?: string;
  email?: string;
  planId?: string;
}

export type UpdateUserResponseDto = UserFullDto;
