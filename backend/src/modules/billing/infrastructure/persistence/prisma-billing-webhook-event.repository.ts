import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  BeginBillingWebhookEventInput,
  BeginBillingWebhookEventResult,
  BillingWebhookEventDetails,
  BillingWebhookEventRecord,
  BillingWebhookAppliedAction,
  IBillingWebhookEventRepository,
} from '@/modules/billing/application/repositories/billing-webhook-event.repository.interface';

const toRecord = (input: BeginBillingWebhookEventInput['payload']): Prisma.InputJsonObject =>
  input as Prisma.InputJsonObject;

const toWebhookRecord = (
  row: Awaited<ReturnType<typeof prisma.billingWebhookEvent.create>>
): BillingWebhookEventRecord => ({
  ...row,
  appliedAction: (row.appliedAction as BillingWebhookAppliedAction | null) ?? null,
});

const toWebhookDetails = (
  row: Awaited<ReturnType<typeof prisma.billingWebhookEvent.findUnique>>
): BillingWebhookEventDetails | null => {
  if (!row) {
    return null;
  }

  return {
    ...toWebhookRecord(row),
    eventType: row.eventType,
    signature: row.signature,
    payload:
      row.payload && typeof row.payload === 'object' && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
  };
};

export class PrismaBillingWebhookEventRepository implements IBillingWebhookEventRepository {
  async begin(input: BeginBillingWebhookEventInput): Promise<BeginBillingWebhookEventResult> {
    try {
      const created = await prisma.billingWebhookEvent.create({
        data: {
          provider: input.provider,
          eventId: input.eventId,
          eventType: input.eventType,
          signature: input.signature,
          payload: toRecord(input.payload),
          userId: input.userId,
          status: 'PROCESSING',
        },
      });

      return {
        event: toWebhookRecord(created),
        isReplay: false,
        canProcess: true,
      };
    } catch (error) {
      const isConflict =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (!isConflict) {
        throw error;
      }

      const existing = await prisma.billingWebhookEvent.findUnique({
        where: {
          provider_eventId: {
            provider: input.provider,
            eventId: input.eventId,
          },
        },
      });

      if (!existing) {
        throw error;
      }

      if (existing.status === 'FAILED') {
        const retried = await prisma.billingWebhookEvent.update({
          where: { id: existing.id },
          data: {
            status: 'PROCESSING',
            error: null,
            processedAt: null,
            signature: input.signature,
            payload: toRecord(input.payload),
            userId: input.userId,
            eventType: input.eventType,
          },
        });

        return {
          event: toWebhookRecord(retried),
          isReplay: true,
          canProcess: true,
        };
      }

      return {
        event: toWebhookRecord(existing),
        isReplay: true,
        canProcess: false,
      };
    }
  }

  async markProcessed(
    id: string,
    appliedAction: BillingWebhookAppliedAction,
    metadata?: { processedAt?: Date }
  ): Promise<void> {
    await prisma.billingWebhookEvent.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        appliedAction,
        error: null,
        processedAt: metadata?.processedAt ?? new Date(),
      },
    });
  }

  async markIgnored(id: string, reason?: string): Promise<void> {
    await prisma.billingWebhookEvent.update({
      where: { id },
      data: {
        status: 'IGNORED',
        error: reason ?? null,
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await prisma.billingWebhookEvent.update({
      where: { id },
      data: {
        status: 'FAILED',
        error,
      },
    });
  }

  async getFailedByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = {
      userId,
      status: 'FAILED' as const,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.billingWebhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.billingWebhookEvent.count({ where }),
    ]);

    return {
      events: rows.map((row) => toWebhookRecord(row)),
      total,
    };
  }

  async findFailedByIdForUser(
    userId: string,
    eventId: string
  ): Promise<BillingWebhookEventDetails | null> {
    const row = await prisma.billingWebhookEvent.findFirst({
      where: {
        id: eventId,
        userId,
        status: 'FAILED',
      },
    });

    return toWebhookDetails(row);
  }
}
