import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface DeleteUserRequestDto {
  userId: string;
}

export type DeleteUserResponseDto = UserFullDto;
