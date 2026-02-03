import { User } from '../user.aggregate';
import { UserEmail } from '../value-objects/user-email.vo';

export interface IUserRepository {
  exists(email: UserEmail): Promise<boolean>;
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: UserEmail): Promise<User | null>;
  delete(id: string): Promise<void>;
}
