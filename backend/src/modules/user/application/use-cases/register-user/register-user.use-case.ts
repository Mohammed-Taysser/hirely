import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/user.aggregate';
import { UserEmail } from '../../../domain/value-objects/user-email.vo';
import { UserName } from '../../../domain/value-objects/user-name.vo';
import { UserPassword } from '../../../domain/value-objects/user-password.vo';
import { UserDtoMapper } from '../../mappers/user.dto.mapper';
import { UserDto } from '../../user.dto';

import { RegisterUserRequestDto } from './register-user.dto';

import {
  ConflictError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { IPasswordHasher } from '@/modules/shared/application/services/password-hasher.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

export type RegisterUserResponse = Result<
  UserDto,
  ValidationError | ConflictError | UnexpectedError
>;

export class RegisterUserUseCase implements UseCase<RegisterUserRequestDto, RegisterUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  public async execute(request: RegisterUserRequestDto): Promise<RegisterUserResponse> {
    const emailResult = UserEmail.create(request.email);
    const nameResult = UserName.create(request.name);
    const passwordResult = UserPassword.create(request.password);

    const result = Result.combine([emailResult, nameResult, passwordResult]);

    if (result.isFailure) {
      return Result.fail(new ValidationError(result.error as string));
    }

    const email = emailResult.getValue();
    const name = nameResult.getValue();
    const password = passwordResult.getValue();

    try {
      const userAlreadyExists = await this.userRepository.exists(email);

      if (userAlreadyExists) {
        return Result.fail(new ConflictError('User already exists'));
      }

      const hashedPassword = await this.passwordHasher.hash(password.value);
      const hashedUserPassword = UserPassword.create(hashedPassword, true).getValue();

      const userResult = User.register({
        email,
        name,
        password: hashedUserPassword,
        planId: request.planId,
      });

      if (userResult.isFailure) {
        return Result.fail(new ValidationError(userResult.error as string));
      }

      const user = userResult.getValue();

      await this.userRepository.save(user);

      return Result.ok(UserDtoMapper.toResponse(user));
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
