import { CreateUserWithPlanRequestDto } from './create-user-with-plan.dto';

import {
  ConflictError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IPlanQueryRepository } from '@/modules/plan/application/repositories/plan.query.repository.interface';
import {
  IUserQueryRepository,
  UserFullDto,
} from '@/modules/user/application/repositories/user.query.repository.interface';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user/register-user.use-case';

export type CreateUserWithPlanResponse = Result<
  UserFullDto,
  ValidationError | ConflictError | NotFoundError | UnexpectedError
>;

export class CreateUserWithPlanUseCase implements UseCase<
  CreateUserWithPlanRequestDto,
  CreateUserWithPlanResponse
> {
  constructor(
    private readonly planQueryRepository: IPlanQueryRepository,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly userQueryRepository: IUserQueryRepository
  ) {}

  public async execute(request: CreateUserWithPlanRequestDto): Promise<CreateUserWithPlanResponse> {
    try {
      const planCode = request.planCode ?? 'FREE';
      const plan = await this.planQueryRepository.findByCode(planCode);

      if (!plan) {
        return Result.fail(new NotFoundError('Plan not found'));
      }

      const registerResult = await this.registerUserUseCase.execute({
        email: request.email,
        name: request.name,
        password: request.password,
        planId: plan.id,
      });

      if (registerResult.isFailure) {
        const error = registerResult.error ?? new UnexpectedError(new Error('Registration failed'));
        return Result.fail(error);
      }

      const user = await this.userQueryRepository.findById(registerResult.getValue().id);
      if (!user) {
        return Result.fail(new UnexpectedError(new Error('Created user not found')));
      }

      return Result.ok(user);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
