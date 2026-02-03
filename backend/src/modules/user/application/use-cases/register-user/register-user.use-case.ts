import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/user.aggregate';
import { UserEmail } from '../../../domain/value-objects/user-email.vo';
import { UserName } from '../../../domain/value-objects/user-name.vo';
import { UserPassword } from '../../../domain/value-objects/user-password.vo';
import { UserDtoMapper } from '../../mappers/user.dto.mapper';
import { UserDto } from '../../user.dto';

import { RegisterUserRequestDto } from './register-user.dto';

import { UnexpectedError, ValidationError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import tokenService from '@/modules/shared/services/token.service';

export type RegisterUserResponse = Result<UserDto, ValidationError | UnexpectedError>;

export class RegisterUserUseCase implements UseCase<RegisterUserRequestDto, RegisterUserResponse> {
  constructor(private readonly userRepository: IUserRepository) {}

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
        return Result.fail(new ValidationError('User already exists'));
      }

      const hashedPassword = await tokenService.hash(password.value);
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
