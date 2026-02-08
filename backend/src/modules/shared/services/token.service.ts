import jwt from 'jsonwebtoken';

import { ITokenService, UserTokenPayload } from '../application/services/token.service.interface';

import ennValidation from '@/apps/config';

class TokenService implements ITokenService {
  private readonly SECRET = ennValidation.JWT_SECRET;
  private readonly ACCESS_EXPIRY = ennValidation.JWT_ACCESS_EXPIRES_IN;
  private readonly REFRESH_EXPIRY = ennValidation.JWT_REFRESH_EXPIRES_IN;

  private preparePayload(payload: UserTokenPayload): UserTokenPayload {
    return {
      id: payload.id,
      email: payload.email,
    };
  }

  signAccessToken(payload: UserTokenPayload): string {
    return jwt.sign(this.preparePayload(payload), this.SECRET, {
      expiresIn: this.ACCESS_EXPIRY,
    });
  }

  signRefreshToken(payload: UserTokenPayload): string {
    return jwt.sign(this.preparePayload(payload), this.SECRET, {
      expiresIn: this.REFRESH_EXPIRY,
    });
  }

  verifyToken<T>(token: string): T {
    return jwt.verify(token, this.SECRET) as T;
  }
}

const tokenService = new TokenService();

export default tokenService;
