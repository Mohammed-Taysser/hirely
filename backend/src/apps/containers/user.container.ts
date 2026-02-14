import {
  auditLogService,
  billingService,
  planLimitQueryRepository,
  passwordHasherService,
  planQueryRepository,
  resumeExportRepository,
  resumeQueryRepository,
  systemLogService,
  systemLogQueryRepository,
  userQueryRepository,
  userRepository,
} from '@/apps/container.shared';
import { ChangeUserPlanUseCase } from '@/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case';
import { CreateUserWithPlanUseCase } from '@/modules/user/application/use-cases/create-user-with-plan/create-user-with-plan.use-case';
import { DeleteUserUseCase } from '@/modules/user/application/use-cases/delete-user/delete-user.use-case';
import { GetUserByIdQueryUseCase } from '@/modules/user/application/use-cases/get-user-by-id-query/get-user-by-id-query.use-case';
import { GetUserPlanUsageUseCase } from '@/modules/user/application/use-cases/get-user-plan-usage/get-user-plan-usage.use-case';
import { GetUsersUseCase } from '@/modules/user/application/use-cases/get-users/get-users.use-case';
import { GetUsersListUseCase } from '@/modules/user/application/use-cases/get-users-list/get-users-list.use-case';
import { UpdateUserUseCase } from '@/modules/user/application/use-cases/update-user/update-user.use-case';

const createUserWithPlanUseCase = new CreateUserWithPlanUseCase(
  planQueryRepository,
  userRepository,
  passwordHasherService,
  userQueryRepository,
  systemLogService,
  auditLogService
);
const getUsersUseCase = new GetUsersUseCase(userQueryRepository);
const getUsersListUseCase = new GetUsersListUseCase(userQueryRepository);
const updateUserUseCase = new UpdateUserUseCase(
  userRepository,
  userQueryRepository,
  systemLogService,
  auditLogService
);
const deleteUserUseCase = new DeleteUserUseCase(
  userRepository,
  userQueryRepository,
  systemLogService,
  auditLogService
);
const changeUserPlanUseCase = new ChangeUserPlanUseCase(
  userRepository,
  userQueryRepository,
  planQueryRepository,
  billingService,
  systemLogService,
  auditLogService
);
const getUserByIdQueryUseCase = new GetUserByIdQueryUseCase(userQueryRepository);
const getUserPlanUsageUseCase = new GetUserPlanUsageUseCase(
  userQueryRepository,
  planLimitQueryRepository,
  resumeQueryRepository,
  resumeExportRepository,
  systemLogQueryRepository
);

const userContainer = {
  getUsersUseCase,
  getUsersListUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  changeUserPlanUseCase,
  getUserByIdQueryUseCase,
  getUserPlanUsageUseCase,
  createUserWithPlanUseCase,
};

export { createUserWithPlanUseCase, userContainer };
