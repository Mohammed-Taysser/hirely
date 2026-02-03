import { UserDtoMapper } from '../../mappers/user.dto.mapper';
import { UserDto } from '../../user.dto';

import { FindUserByIdRequestDto } from './find-user-by-id.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

type FindUserByIdResponse = Result<UserDto, NotFoundError | UnexpectedError>;

export class FindUserByIdUseCase implements UseCase<FindUserByIdRequestDto, FindUserByIdResponse> {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(request: FindUserByIdRequestDto): Promise<FindUserByIdResponse> {
    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      return Result.ok(UserDtoMapper.toResponse(user));
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
