import { ActivityService } from '@dist/modules/activity/infrastructure/services/activity.service';

describe('ActivityService', () => {
  it('logs activity without throwing', async () => {
    const service = new ActivityService();

    await expect(
      service.log('user-1', 'resume.export.requested', { resumeId: 'resume-1' })
    ).resolves.toBeUndefined();
  });
});
