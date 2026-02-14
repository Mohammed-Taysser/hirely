export interface ResolvePlanChangeScheduleRequest {
  userId: string;
  currentPlanId: string;
  targetPlanId: string;
  requestedScheduleAt?: Date | null;
}

export interface ResolvePlanChangeScheduleResponse {
  effectiveAt: Date | null;
  reason: 'immediate' | 'user-scheduled' | 'billing-cycle';
}

export interface IBillingService {
  enforceDailyUploadLimit(userId: string, planId: string, size: number): Promise<void>;
  resolvePlanChangeSchedule(
    request: ResolvePlanChangeScheduleRequest
  ): Promise<ResolvePlanChangeScheduleResponse>;
}
