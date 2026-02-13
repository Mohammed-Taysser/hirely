import { DateRangeInput } from '@/modules/shared/application/filters';

export interface UserPlanDto {
  id: string;
  code: string;
  name: string;
}

export interface UserBasicDto {
  id: string;
  name: string;
}

export interface UserAuthDto {
  id: string;
  email: string;
  passwordHash: string;
}

export interface UserFullDto extends UserBasicDto {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  planId: string;
  pendingPlanId?: string | null;
  pendingPlanAt?: Date | null;
  plan?: UserPlanDto | null;
  isVerified: boolean;
  isDeleted: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
  resumes?: Array<Record<string, unknown>>;
}

export interface UserQueryFilters {
  name?: string;
  email?: string;
  createdAt?: DateRangeInput;
}

export interface IUserQueryRepository {
  getPaginatedUsers(
    page: number,
    limit: number,
    filters: UserQueryFilters
  ): Promise<[UserFullDto[], number]>;
  getBasicUsers(filters: UserQueryFilters): Promise<UserBasicDto[]>;
  findAuthByEmail(email: string): Promise<UserAuthDto | null>;
  findById(id: string): Promise<UserFullDto | null>;
}
