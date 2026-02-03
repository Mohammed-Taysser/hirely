export interface UserTokenPayload {
  id: string;
  email: string;
}

export interface ITokenService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
  signAccessToken(payload: UserTokenPayload): string;
  signRefreshToken(payload: UserTokenPayload): string;
  verifyToken<T = unknown>(token: string): T;
}
