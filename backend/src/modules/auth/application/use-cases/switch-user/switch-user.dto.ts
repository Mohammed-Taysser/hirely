export interface SwitchUserRequestDto {
  userId: string;
}

export interface SwitchUserResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    planId: string;
  };
  accessToken: string;
  refreshToken: string;
}
