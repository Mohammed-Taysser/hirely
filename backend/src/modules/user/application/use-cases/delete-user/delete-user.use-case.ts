import { DeleteUserRequestDto, DeleteUserResponseDto } from './delete-user.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type DeleteUserResponse = Result<DeleteUserResponseDto, UnexpectedError | NotFoundError>;

export class DeleteUserUseCase implements UseCase<DeleteUserRequestDto, DeleteUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  public async execute(request: DeleteUserRequestDto): Promise<DeleteUserResponse> {
    try {
      const user = await this.userQueryRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      await this.userRepository.delete(request.userId);

      return Result.ok(user);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
