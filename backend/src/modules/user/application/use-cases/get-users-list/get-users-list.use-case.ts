import { GetUsersListRequestDto, GetUsersListResponseDto } from './get-users-list.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type GetUsersListResponse = Result<GetUsersListResponseDto, UnexpectedError>;

export class GetUsersListUseCase implements UseCase<GetUsersListRequestDto, GetUsersListResponse> {
  constructor(private readonly userQueryRepository: IUserQueryRepository) {}

  public async execute(request: GetUsersListRequestDto): Promise<GetUsersListResponse> {
    try {
      const users = await this.userQueryRepository.getBasicUsers(request.filters);

      return Result.ok(users);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
