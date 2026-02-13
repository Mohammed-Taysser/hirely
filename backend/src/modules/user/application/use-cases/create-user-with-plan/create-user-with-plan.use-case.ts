import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';
import {
  ConflictError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { IPasswordHasher } from '@/modules/shared/application/services/password-hasher.service.interface';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogService } from '@/modules/system/application/services/system-log.service.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';
import {
  CreateUserWithPlanRequestDto,
  CreateUserWithPlanResponse,
  ICreateUserWithPlanService,
} from '@/modules/user/application/services/create-user-with-plan.service.interface';
import { IUserRepository } from '@/modules/user/domain/repositories/user.repository.interface';
import { User } from '@/modules/user/domain/user.aggregate';
import { UserEmail } from '@/modules/user/domain/value-objects/user-email.vo';
import { UserName } from '@/modules/user/domain/value-objects/user-name.vo';
import { UserPassword } from '@/modules/user/domain/value-objects/user-password.vo';

export class CreateUserWithPlanUseCase
  implements
    UseCase<CreateUserWithPlanRequestDto, CreateUserWithPlanResponse>,
    ICreateUserWithPlanService
{
  constructor(
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly systemLogService: ISystemLogService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: CreateUserWithPlanRequestDto): Promise<CreateUserWithPlanResponse> {
    try {
      const planCode = request.planCode ?? 'FREE';
      const plan = await this.planQueryRepository.findByCode(planCode);

      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const emailResult = UserEmail.create(request.email);
      const nameResult = UserName.create(request.name);
      const passwordResult = UserPassword.create(request.password);

      const validation = Result.combine([emailResult, nameResult, passwordResult]);
      if (validation.isFailure) {
        return Result.fail(new ValidationError(validation.error as string));
      }

      const email = emailResult.getValue();
      const name = nameResult.getValue();
      const password = passwordResult.getValue();

      const userAlreadyExists = await this.userRepository.exists(email);
      if (userAlreadyExists) {
        return Result.fail(new ConflictError('User already exists'));
      }

      const hashedPassword = await this.passwordHasher.hash(password.value);
      const hashedPasswordResult = UserPassword.create(hashedPassword, true);
      if (hashedPasswordResult.isFailure) {
        return Result.fail(new ValidationError(hashedPasswordResult.error as string));
      }

      const userResult = User.register({
        email,
        name,
        password: hashedPasswordResult.getValue(),
        planId: plan.id,
      });
      if (userResult.isFailure) {
        return Result.fail(new ValidationError(userResult.error as string));
      }

      const userAggregate = userResult.getValue();
      await this.userRepository.save(userAggregate);

      const user = await this.userQueryRepository.findById(userAggregate.id);
      if (!user) {
        return Result.fail(new UnexpectedError(new Error('Created user not found')));
      }

      await this.systemLogService.log({
        level: 'info',
        action: SystemActions.USER_CREATED,
        userId: user.id,
        metadata: { planId: plan.id, planCode: plan.code },
      });

      await this.auditLogService.log({
        action: AuditActions.USER_REGISTERED,
        actorUserId: user.id,
        ...buildAuditEntity('user', user.id),
        metadata: { planId: plan.id, planCode: plan.code },
      });

      return Result.ok(user);
    } catch (err) {
      await this.systemLogService.log({
        level: 'error',
        action: SystemActions.USER_CREATE_FAILED,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
      return Result.fail(new UnexpectedError(err));
    }
  }
}
