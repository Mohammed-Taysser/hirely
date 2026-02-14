import prisma from '@/apps/prisma';
import { IUserPlanCommandRepository } from '@/modules/user/application/repositories/user-plan-command.repository.interface';

export class PrismaUserPlanCommandRepository implements IUserPlanCommandRepository {
  async changePlanNow(userId: string, planId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        planId,
        pendingPlanId: null,
        pendingPlanAt: null,
      },
    });
  }

  async schedulePlanChange(userId: string, planId: string, at: Date): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingPlanId: planId,
        pendingPlanAt: at,
      },
    });
  }
}
