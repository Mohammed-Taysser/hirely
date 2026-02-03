export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    planId: string;
  };
  accessToken: string;
  refreshToken: string;
}
