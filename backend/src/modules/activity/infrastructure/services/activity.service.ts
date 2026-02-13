import { IActivityService } from '@/modules/activity/application/services/activity.service.interface';
import loggerService from '@/modules/shared/infrastructure/services/logger.service';

export class ActivityService implements IActivityService {
  async log(userId: string, type: string, metadata?: Record<string, unknown>): Promise<void> {
    loggerService.info(`[Activity] ${userId} - ${type}`, metadata);
  }
}
