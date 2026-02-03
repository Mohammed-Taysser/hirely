import { UserDtoMapper } from '../../mappers/user.dto.mapper';
import { UserDto } from '../../user.dto';

import { UpdateUserRequestDto } from './update-user.dto';

import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { UserEmail } from '@/modules/user/domain/value-objects/user-email.vo';
import { UserName } from '@/modules/user/domain/value-objects/user-name.vo';

type UpdateUserResponse = Result<UserDto, ValidationError | UnexpectedError | NotFoundError>;

export class UpdateUserUseCase implements UseCase<UpdateUserRequestDto, UpdateUserResponse> {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(request: UpdateUserRequestDto): Promise<UpdateUserResponse> {
    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      if (request.name) {
        const nameOrError = UserName.create(request.name);
        if (nameOrError.isFailure) {
          return Result.fail(new ValidationError(nameOrError.error as string));
        }
        user.updateName(nameOrError.getValue());
      }

      if (request.email) {
        const emailOrError = UserEmail.create(request.email);
        if (emailOrError.isFailure) {
          return Result.fail(new ValidationError(emailOrError.error as string));
        }
        user.updateEmail(emailOrError.getValue());
      }

      if (request.planId) {
        // Assuming planId validation is simple or handled elsewhere for now
        user.changePlan(request.planId);
      }

      await this.userRepository.save(user);

      return Result.ok(UserDtoMapper.toResponse(user));
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
