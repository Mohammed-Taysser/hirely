import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  ISystemLogService,
  SystemLogInput,
} from '@/modules/system/application/services/system-log.service.interface';

export class PrismaSystemLogService implements ISystemLogService {
  async log(input: SystemLogInput): Promise<void> {
    const { level, action, message, userId, metadata } = input;

    await prisma.systemLog.create({
      data: {
        level,
        action,
        message,
        userId: userId ?? null,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
