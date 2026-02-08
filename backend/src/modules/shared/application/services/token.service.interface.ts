export interface UserTokenPayload {
  id: string;
  email: string;
}

export interface ITokenService {
  signAccessToken(payload: UserTokenPayload): string;
  signRefreshToken(payload: UserTokenPayload): string;
  verifyToken<T = unknown>(token: string): T;
}
