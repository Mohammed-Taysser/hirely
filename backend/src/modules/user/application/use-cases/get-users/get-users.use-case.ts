import { GetUsersRequestDto, GetUsersResponseDto } from './get-users.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type GetUsersResponse = Result<GetUsersResponseDto, UnexpectedError>;

export class GetUsersUseCase implements UseCase<GetUsersRequestDto, GetUsersResponse> {
  constructor(private readonly userQueryRepository: IUserQueryRepository) {}

  public async execute(request: GetUsersRequestDto): Promise<GetUsersResponse> {
    try {
      const [users, total] = await this.userQueryRepository.getPaginatedUsers(
        request.page,
        request.limit,
        request.filters
      );

      return Result.ok({ users, total });
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
