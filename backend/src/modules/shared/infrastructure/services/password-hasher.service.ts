import bcrypt from 'bcrypt';

import { IPasswordHasher } from '../../application/services/password-hasher.service.interface';

class PasswordHasherService implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

const passwordHasherService = new PasswordHasherService();

export default passwordHasherService;
