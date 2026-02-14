import { ExportService } from '@dist/modules/resume/application/services/export.service';

const buildDependencies = () => {
  const resumeSnapshotRepository = {
    createSnapshot: jest.fn().mockResolvedValue({
      id: 'snapshot-1',
      userId: 'user-1',
      resumeId: 'resume-1',
      data: {
        meta: { title: 'Resume', language: 'en' },
        sections: {
          summary: { type: 'summary', content: { text: 'About me' } },
        },
      },
      createdAt: new Date(),
    }),
  };

  const storageService = {
    uploadBuffer: jest.fn().mockResolvedValue({
      key: 'user-1/2026-02-14/exports/export-1.pdf',
      url: 'file:///tmp/export-1.pdf',
    }),
    getSignedDownloadUrl: jest.fn(),
    deleteObject: jest.fn(),
  };

  const exportEmailQueueService = {
    enqueue: jest.fn().mockResolvedValue(undefined),
  };

  const billingService = {
    enforceDailyUploadLimit: jest.fn().mockResolvedValue(undefined),
  };

  const activityService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  const planLimitQueryRepository = {
    findByPlanId: jest.fn().mockResolvedValue({
      id: 'limit-1',
      planId: 'plan-1',
      maxResumes: 10,
      maxExports: 10,
      dailyUploadMb: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  };

  const userQueryRepository = {
    findById: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      planId: 'plan-1',
      plan: { id: 'plan-1', code: 'PRO', name: 'Pro' },
    }),
  };

  const resumeExportRepository = {
    create: jest.fn().mockResolvedValue({
      id: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
      status: 'PENDING',
      url: null,
      sizeBytes: null,
      error: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    markReady: jest.fn().mockResolvedValue({
      id: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
      status: 'READY',
      url: 'user-1/2026-02-14/exports/export-1.pdf',
      sizeBytes: 3,
      error: null,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    markFailed: jest.fn().mockResolvedValue({
      id: 'export-1',
      snapshotId: 'snapshot-1',
      userId: 'user-1',
      status: 'FAILED',
      url: null,
      sizeBytes: null,
      error: 'failed',
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    countByUser: jest.fn().mockResolvedValue(0),
    getUploadedBytesByUserInRange: jest.fn().mockResolvedValue(0),
    findExpired: jest.fn(),
    deleteByIds: jest.fn(),
  };

  const resumeExportQueryRepository = {
    getPaginatedExports: jest.fn(),
    findById: jest.fn(),
    findByIdForResume: jest.fn(),
  };

  const resumeSnapshotQueryRepository = {
    findByIdWithResume: jest.fn().mockResolvedValue({
      id: 'snapshot-1',
      resumeId: 'resume-1',
      userId: 'user-1',
      data: {
        meta: { title: 'Resume', language: 'en' },
        sections: {
          summary: { type: 'summary', content: { text: 'About me' } },
        },
      },
      templateId: 'classic',
      themeConfig: null,
      createdAt: new Date(),
    }),
  };

  const resumeQueryRepository = {
    findById: jest.fn(),
    findByIdForExport: jest.fn().mockResolvedValue({
      id: 'resume-1',
      userId: 'user-1',
      data: {
        meta: { title: 'Resume', language: 'en' },
        sections: {
          summary: { type: 'summary', content: { text: 'About me' } },
        },
      },
      templateId: 'classic',
      themeConfig: null,
    }),
    getPaginatedResumes: jest.fn(),
    getBasicResumes: jest.fn(),
    getPaginatedSnapshots: jest.fn(),
  };

  const pdfRenderer = {
    renderPdfFromHtml: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  };

  const resumeTemplateRenderer = {
    renderHtml: jest.fn().mockReturnValue('<html></html>'),
  };

  const service = new ExportService(
    resumeSnapshotRepository,
    storageService,
    exportEmailQueueService,
    billingService,
    activityService,
    planLimitQueryRepository,
    userQueryRepository,
    resumeExportRepository,
    resumeExportQueryRepository,
    resumeSnapshotQueryRepository,
    resumeQueryRepository,
    pdfRenderer,
    resumeTemplateRenderer
  );

  return {
    service,
    billingService,
    resumeExportRepository,
    pdfRenderer,
    storageService,
    resumeSnapshotQueryRepository,
  };
};

describe('ExportService', () => {
  it('enforces billing using generated pdf size before storing export', async () => {
    const deps = buildDependencies();

    const result = await deps.service.generateAndStoreExport('user-1', 'resume-1');

    expect(result.exportRecordId).toBe('export-1');
    expect(deps.billingService.enforceDailyUploadLimit).toHaveBeenCalledWith('user-1', 'plan-1', 3);
    expect(deps.resumeExportRepository.markReady).toHaveBeenCalledWith(
      'export-1',
      'user-1/2026-02-14/exports/export-1.pdf',
      3,
      expect.any(Date)
    );
  });

  it('marks failed export when processing throws after billing check', async () => {
    const deps = buildDependencies();
    deps.storageService.uploadBuffer.mockRejectedValue(new Error('upload failed'));

    await expect(
      deps.service.processPdfExport({
        exportId: 'export-1',
        snapshotId: 'snapshot-1',
        userId: 'user-1',
      })
    ).rejects.toThrow('upload failed');

    expect(deps.billingService.enforceDailyUploadLimit).toHaveBeenCalledWith('user-1', 'plan-1', 3);
    expect(deps.resumeExportRepository.markFailed).toHaveBeenCalledWith('export-1', 'upload failed');
  });
});
