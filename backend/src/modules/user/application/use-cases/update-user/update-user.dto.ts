export interface UpdateUserRequestDto {
  userId: string;
  name?: string;
  email?: string;
  planId?: string;
}

export interface UpdateUserResponseDto {
  id: string;
  name: string;
  email: string;
  planId: string;
}
