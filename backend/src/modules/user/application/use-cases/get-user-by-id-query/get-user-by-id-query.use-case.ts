import { GetUserByIdQueryRequestDto } from './get-user-by-id-query.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserQueryRepository, UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

type GetUserByIdQueryResponse = Result<UserFullDto, NotFoundError | UnexpectedError>;

export class GetUserByIdQueryUseCase
  implements UseCase<GetUserByIdQueryRequestDto, GetUserByIdQueryResponse>
{
  constructor(private readonly userQueryRepository: IUserQueryRepository) {}

  public async execute(request: GetUserByIdQueryRequestDto): Promise<GetUserByIdQueryResponse> {
    try {
      const user = await this.userQueryRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      return Result.ok(user);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
