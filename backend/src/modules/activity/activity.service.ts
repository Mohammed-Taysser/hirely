class ActivityService {
  async log(userId: string, type: string, metadata?: Record<string, any>) {
    console.log(`[Activity] ${userId} - ${type}`, metadata);
  }
}

export const activityService = new ActivityService();
