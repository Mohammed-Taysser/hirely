import { User } from '../../domain/user.aggregate';
import { UserDto } from '../user.dto';

export class UserDtoMapper {
  public static toResponse(user: User): UserDto {
    return {
      id: user.id,
      name: user.name.value,
      email: user.email.value,
      planId: user.planId,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
