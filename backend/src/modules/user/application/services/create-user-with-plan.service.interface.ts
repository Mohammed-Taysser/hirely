import {
  ConflictError,
  NotFoundError,
  UnexpectedError,
  ValidationError,
} from '@/modules/shared/application/app-error';
import { Result } from '@/modules/shared/domain';
import { UserFullDto } from '@/modules/user/application/repositories/user.query.repository.interface';

export interface CreateUserWithPlanRequestDto {
  email: string;
  name: string;
  password: string;
  planCode?: string;
}

export type CreateUserWithPlanResponse = Result<
  UserFullDto,
  ValidationError | ConflictError | NotFoundError | UnexpectedError
>;

export interface ICreateUserWithPlanService {
  execute(request: CreateUserWithPlanRequestDto): Promise<CreateUserWithPlanResponse>;
}
