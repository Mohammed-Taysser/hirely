export interface CreateUserWithPlanRequestDto {
  email: string;
  name: string;
  password: string;
  planCode?: string;
}
