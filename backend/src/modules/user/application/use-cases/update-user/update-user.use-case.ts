import { UpdateUserRequestDto, UpdateUserResponseDto } from './update-user.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import {
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { UserEmail } from '@/modules/user/domain/value-objects/user-email.vo';
import { UserName } from '@/modules/user/domain/value-objects/user-name.vo';

type UpdateUserResponse = Result<
  UpdateUserResponseDto,
  ValidationError | UnexpectedError | NotFoundError
>;

export class UpdateUserUseCase implements UseCase<UpdateUserRequestDto, UpdateUserResponse> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

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

      const updatedUser = await this.userQueryRepository.findById(user.id);
      if (!updatedUser) {
        return Result.fail(new NotFoundError('User not found'));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.USER_UPDATED,
        userId: user.id,
      });

      await this.auditLogService.log({
        action: AuditActions.USER_UPDATED,
        actorUserId: user.id,
        ...buildAuditEntity('user', user.id),
        metadata: {
          updatedFields: {
            name: Boolean(request.name),
            email: Boolean(request.email),
            planId: Boolean(request.planId),
          },
        },
      });

      return Result.ok(updatedUser);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.USER_UPDATE_FAILED,
        userId: request.userId,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
