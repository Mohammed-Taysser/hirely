export interface DeleteUserRequestDto {
  userId: string;
}

export interface DeleteUserResponseDto {
  id: string;
  name: string;
  email: string;
  planId: string;
}
