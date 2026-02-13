import prisma from '@/apps/prisma';
import {
  AppliedUserPlanChange,
  IUserPlanChangeRepository,
} from '@/modules/user/application/repositories/user-plan-change.repository.interface';

export class PrismaUserPlanChangeRepository implements IUserPlanChangeRepository {
  async applyScheduledPlanChanges(now: Date): Promise<AppliedUserPlanChange[]> {
    const users = await prisma.user.findMany({
      where: {
        pendingPlanId: { not: null },
        pendingPlanAt: { lte: now },
      },
      select: { id: true, pendingPlanId: true },
    });

    const applied: AppliedUserPlanChange[] = [];

    for (const user of users) {
      if (!user.pendingPlanId) {
        continue;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          planId: user.pendingPlanId,
          pendingPlanId: null,
          pendingPlanAt: null,
        },
      });

      applied.push({ userId: user.id, planId: user.pendingPlanId });
    }

    return applied;
  }
}
