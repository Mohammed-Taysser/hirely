import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';

export class ActivityService implements IActivityService {
  async log(userId: string, type: string, metadata?: Record<string, unknown>): Promise<void> {
    console.log(`[Activity] ${userId} - ${type}`, metadata);
  }
}
