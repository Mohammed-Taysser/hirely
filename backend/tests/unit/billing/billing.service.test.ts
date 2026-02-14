const mockFindPlanLimit = jest.fn();
const mockAggregateExports = jest.fn();

jest.mock('@dist/apps/prisma', () => ({
  __esModule: true,
  default: {
    planLimit: {
      findUnique: (...args: unknown[]) => mockFindPlanLimit(...args),
    },
    resumeExport: {
      aggregate: (...args: unknown[]) => mockAggregateExports(...args),
    },
  },
}));

import { BillingService } from '@dist/modules/billing/infrastructure/services/billing.service';
import { ForbiddenError } from '@dist/modules/shared/application/app-error';

describe('BillingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPlanLimit.mockResolvedValue({
      id: 'limit-1',
      planId: 'plan-1',
      maxResumes: 10,
      maxExports: 10,
      dailyUploadMb: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockAggregateExports.mockResolvedValue({
      _sum: {
        sizeBytes: 0,
      },
    });
  });

  it('returns early for invalid input', async () => {
    const service = new BillingService();

    await expect(service.enforceDailyUploadLimit('', '', 0)).resolves.toBeUndefined();
    expect(mockFindPlanLimit).not.toHaveBeenCalled();
    expect(mockAggregateExports).not.toHaveBeenCalled();
  });

  it('throws when plan limits are missing', async () => {
    const service = new BillingService();
    mockFindPlanLimit.mockResolvedValue(null);

    await expect(service.enforceDailyUploadLimit('user-1', 'plan-1', 1024)).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });

  it('throws when daily upload limit would be exceeded', async () => {
    const service = new BillingService();
    mockAggregateExports.mockResolvedValue({
      _sum: {
        sizeBytes: 1024 * 1024,
      },
    });

    await expect(service.enforceDailyUploadLimit('user-1', 'plan-1', 1)).rejects.toBeInstanceOf(
      ForbiddenError
    );
  });

  it('allows upload when usage stays within plan limit', async () => {
    const service = new BillingService();
    mockAggregateExports.mockResolvedValue({
      _sum: {
        sizeBytes: 256 * 1024,
      },
    });

    await expect(service.enforceDailyUploadLimit('user-1', 'plan-1', 128 * 1024)).resolves.toBeUndefined();
    expect(mockFindPlanLimit).toHaveBeenCalledWith({ where: { planId: 'plan-1' } });
    expect(mockAggregateExports).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-1',
          status: 'READY',
        }),
      })
    );
  });
});
