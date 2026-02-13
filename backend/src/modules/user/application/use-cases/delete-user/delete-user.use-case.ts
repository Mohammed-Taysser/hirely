import { DeleteUserRequestDto, DeleteUserResponseDto } from './delete-user.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';

type DeleteUserResponse = Result<DeleteUserResponseDto, UnexpectedError | NotFoundError>;

export class DeleteUserUseCase implements UseCase<DeleteUserRequestDto, DeleteUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: DeleteUserRequestDto): Promise<DeleteUserResponse> {
    try {
      const user = await this.userQueryRepository.findById(request.userId);

      if (!user) {
        return Result.fail(new NotFoundError('User not found'));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.USER_DELETED,
        userId: user.id,
      });

      await this.auditLogService.log({
        action: AuditActions.USER_DELETED,
        actorUserId: user.id,
        ...buildAuditEntity('user', user.id),
        metadata: { email: user.email },
      });

      await this.userRepository.delete(request.userId);

      return Result.ok(user);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.USER_DELETE_FAILED,
        userId: request.userId,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
