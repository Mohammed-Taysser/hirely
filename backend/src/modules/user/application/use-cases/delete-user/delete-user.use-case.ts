import { DeleteUserRequestDto, DeleteUserResponseDto } from './delete-user.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

type DeleteUserResponse = Result<DeleteUserResponseDto, UnexpectedError | NotFoundError>;

export class DeleteUserUseCase implements UseCase<DeleteUserRequestDto, DeleteUserResponse> {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(request: DeleteUserRequestDto): Promise<DeleteUserResponse> {
    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      await this.userRepository.delete(request.userId);

      return Result.ok({
        id: user.id,
        name: user.name.value,
        email: user.email.value,
        planId: user.planId,
      });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
