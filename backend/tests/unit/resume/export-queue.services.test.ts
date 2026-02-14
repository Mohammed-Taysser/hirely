type QueueMock = { add: jest.Mock };

type LoadedQueueServices = {
  pdfQueue: QueueMock;
  emailQueue: QueueMock;
  BullmqExportQueueService: new () => { enqueuePdf: (job: unknown) => Promise<void> };
  BullmqExportEmailQueueService: new () => { enqueue: (job: unknown) => Promise<void> };
  BullmqBulkApplyEmailQueueService: new () => { enqueue: (job: unknown) => Promise<void> };
};

const loadQueueServices = async (): Promise<LoadedQueueServices> => {
  jest.resetModules();

  const pdfQueue = { add: jest.fn().mockResolvedValue(undefined) };
  const emailQueue = { add: jest.fn().mockResolvedValue(undefined) };

  jest.doMock('@dist/apps/config', () => ({
    __esModule: true,
    default: {
      EXPORT_JOB_ATTEMPTS: 4,
      EXPORT_JOB_BACKOFF_MS: 5000,
      EXPORT_JOB_KEEP_COMPLETED: 100,
      EXPORT_JOB_KEEP_FAILED: 200,
    },
  }));

  jest.doMock('@dist/jobs/queues/pdf.queue', () => ({
    __esModule: true,
    default: pdfQueue,
  }));

  jest.doMock('@dist/jobs/queues/email.queue', () => ({
    __esModule: true,
    default: emailQueue,
  }));

  const { BullmqExportQueueService } = await import(
    '@dist/modules/resume/infrastructure/services/bullmq-export-queue.service'
  );
  const { BullmqExportEmailQueueService } = await import(
    '@dist/modules/resume/infrastructure/services/bullmq-export-email-queue.service'
  );
  const { BullmqBulkApplyEmailQueueService } = await import(
    '@dist/modules/resume/infrastructure/services/bullmq-bulk-apply-email-queue.service'
  );

  return {
    pdfQueue,
    emailQueue,
    BullmqExportQueueService,
    BullmqExportEmailQueueService,
    BullmqBulkApplyEmailQueueService,
  };
};

describe('bullmq queue services payload contract', () => {
  it('enqueues pdf job with parsed payload and configured retry options', async () => {
    const { BullmqExportQueueService, pdfQueue } = await loadQueueServices();
    const service = new BullmqExportQueueService();

    await service.enqueuePdf({
      exportId: ' export-1 ',
      snapshotId: ' snapshot-1 ',
      userId: ' user-1 ',
    });

    expect(pdfQueue.add).toHaveBeenCalledWith(
      'generate',
      {
        exportId: 'export-1',
        snapshotId: 'snapshot-1',
        userId: 'user-1',
      },
      expect.objectContaining({
        attempts: 4,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      })
    );
  });

  it('rejects invalid pdf queue payload', async () => {
    const { BullmqExportQueueService, pdfQueue } = await loadQueueServices();
    const service = new BullmqExportQueueService();

    await expect(
      service.enqueuePdf({
        exportId: 'export-1',
        userId: 'user-1',
      })
    ).rejects.toThrow();

    expect(pdfQueue.add).not.toHaveBeenCalled();
  });

  it('enqueues free-tier export email with configured retry options', async () => {
    const { BullmqExportEmailQueueService, emailQueue } = await loadQueueServices();
    const service = new BullmqExportEmailQueueService();

    await service.enqueue({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'free-tier-export',
      recipient: { name: 'Hiring Manager' },
    });

    expect(emailQueue.add).toHaveBeenCalledWith(
      'send',
      expect.objectContaining({
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'free-tier-export',
      }),
      expect.objectContaining({
        attempts: 4,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      })
    );
  });

  it('enqueues bulk-apply email with configured retry options', async () => {
    const { BullmqBulkApplyEmailQueueService, emailQueue } = await loadQueueServices();
    const service = new BullmqBulkApplyEmailQueueService();

    await service.enqueue({
      exportId: 'export-1',
      userId: 'user-1',
      to: 'person@example.com',
      reason: 'bulk-apply',
      recipient: {
        email: 'person@example.com',
        company: 'Acme',
      },
    });

    expect(emailQueue.add).toHaveBeenCalledWith(
      'send',
      expect.objectContaining({
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'bulk-apply',
      }),
      expect.objectContaining({
        attempts: 4,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      })
    );
  });

  it('rejects invalid bulk-apply email queue payload', async () => {
    const { BullmqBulkApplyEmailQueueService, emailQueue } = await loadQueueServices();
    const service = new BullmqBulkApplyEmailQueueService();

    await expect(
      service.enqueue({
        exportId: 'export-1',
        userId: 'user-1',
        to: 'person@example.com',
        reason: 'bulk-apply',
        recipient: { name: 'Missing email' },
      })
    ).rejects.toThrow();

    expect(emailQueue.add).not.toHaveBeenCalled();
  });
});
