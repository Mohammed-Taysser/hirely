export interface ChangeUserPlanRequestDto {
  userId: string;
  planCode: string;
  scheduleAt?: string;
}
