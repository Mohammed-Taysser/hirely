import { DateRangeInput } from '@/modules/shared/dto/filters.dto';

export interface UserPlanDto {
  id: string;
  code: string;
  name: string;
}

export interface UserBasicDto {
  id: string;
  name: string;
}

export interface UserFullDto extends UserBasicDto {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  planId: string;
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
  findById(id: string): Promise<UserFullDto | null>;
}
