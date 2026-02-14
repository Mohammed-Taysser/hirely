import { failureResult, successResult } from '../../helpers/test-fixtures';
import { NotFoundError, ValidationError } from '@dist/modules/shared/application/app-error';

const mockGetResumesExecute = jest.fn();
const mockGetResumesListExecute = jest.fn();
const mockGetResumeByIdExecute = jest.fn();
const mockGetResumeSnapshotsExecute = jest.fn();
const mockGetResumeExportsExecute = jest.fn();
const mockGetExportStatusExecute = jest.fn();
const mockRetryFailedExportExecute = jest.fn();
const mockRetryFailedExportEmailJobExecute = jest.fn();
const mockGetResumeExportStatusExecute = jest.fn();
const mockExportResumeExecute = jest.fn();
const mockEnqueueResumeExportExecute = jest.fn();
const mockCreateResumeExecute = jest.fn();
const mockUpdateResumeExecute = jest.fn();
const mockDeleteResumeExecute = jest.fn();
const mockSetDefaultResumeExecute = jest.fn();

jest.mock('@dist/apps/container', () => ({
  resumeContainer: {
    getResumesUseCase: { execute: (...args: unknown[]) => mockGetResumesExecute(...args) },
    getResumesListUseCase: { execute: (...args: unknown[]) => mockGetResumesListExecute(...args) },
    getResumeByIdQueryUseCase: { execute: (...args: unknown[]) => mockGetResumeByIdExecute(...args) },
    getResumeSnapshotsUseCase: { execute: (...args: unknown[]) => mockGetResumeSnapshotsExecute(...args) },
    getResumeExportsUseCase: { execute: (...args: unknown[]) => mockGetResumeExportsExecute(...args) },
    getExportStatusUseCase: { execute: (...args: unknown[]) => mockGetExportStatusExecute(...args) },
    retryFailedExportUseCase: { execute: (...args: unknown[]) => mockRetryFailedExportExecute(...args) },
    retryFailedExportEmailJobUseCase: {
      execute: (...args: unknown[]) => mockRetryFailedExportEmailJobExecute(...args),
    },
    getResumeExportStatusUseCase: {
      execute: (...args: unknown[]) => mockGetResumeExportStatusExecute(...args),
    },
    exportResumeUseCase: { execute: (...args: unknown[]) => mockExportResumeExecute(...args) },
    enqueueResumeExportUseCase: {
      execute: (...args: unknown[]) => mockEnqueueResumeExportExecute(...args),
    },
    createResumeUseCase: { execute: (...args: unknown[]) => mockCreateResumeExecute(...args) },
    updateResumeUseCase: { execute: (...args: unknown[]) => mockUpdateResumeExecute(...args) },
    deleteResumeUseCase: { execute: (...args: unknown[]) => mockDeleteResumeExecute(...args) },
    setDefaultResumeUseCase: { execute: (...args: unknown[]) => mockSetDefaultResumeExecute(...args) },
  },
}));

let resumeController: typeof import('@dist/modules/resume/presentation/resume.controller').default;

const buildResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  setHeader: jest.fn(),
  send: jest.fn(),
});

describe('resume controller integration', () => {
  beforeAll(async () => {
    ({ default: resumeController } = await import('@dist/modules/resume/presentation/resume.controller'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createResume maps request payload and returns 201', async () => {
    mockCreateResumeExecute.mockResolvedValue(
      successResult({
        id: 'resume-1',
        name: 'My Resume',
        templateId: 'classic',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedBody: {
        name: 'My Resume',
        templateId: 'classic',
        data: {
          meta: { title: 'Resume', language: 'en' },
          sections: {
            s1: { type: 'summary', content: { text: 'About me' } },
            s2: {
              type: 'experience',
              content: {
                company: 'ACME',
                role: 'Engineer',
                startDate: new Date('2026-01-01T00:00:00.000Z'),
              },
            },
          },
        },
      },
    };
    const res = buildResponse();

    await resumeController.createResume(req, res);

    expect(mockCreateResumeExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      planId: 'plan-1',
      name: 'My Resume',
      templateId: 'classic',
      templateVersion: undefined,
      themeConfig: undefined,
      data: {
        meta: { title: 'Resume', language: 'en' },
        sections: {
          s1: { type: 'summary', content: { text: 'About me' } },
          s2: {
            type: 'experience',
            content: {
              company: 'ACME',
              role: 'Engineer',
              startDate: '2026-01-01T00:00:00.000Z',
              endDate: null,
            },
          },
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Resume created successfully',
      })
    );
  });

  it('createResume throws mapped http error when use case fails', async () => {
    mockCreateResumeExecute.mockResolvedValue(failureResult(new ValidationError('Invalid resume')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedBody: {
        name: 'My Resume',
        templateId: 'classic',
        data: { meta: { title: 'Resume' }, sections: {} },
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.createResume(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getResumes maps pagination and user filter', async () => {
    mockGetResumesExecute.mockResolvedValue(
      successResult({
        resumes: [{ id: 'resume-1' }],
        total: 1,
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    await resumeController.getResumes(req, res);

    expect(mockGetResumesExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { userId: 'user-1' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Resumes fetched successfully',
      })
    );
  });

  it('getResumes throws mapped error when use case fails', async () => {
    mockGetResumesExecute.mockResolvedValue(failureResult(new ValidationError('Invalid filters')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumes(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getResumesList returns basic list', async () => {
    mockGetResumesListExecute.mockResolvedValue(successResult([{ id: 'resume-1', name: 'R1' }]));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedQuery: { limit: 10, page: 1 },
    };
    const res = buildResponse();

    await resumeController.getResumesList(req, res);

    expect(mockGetResumesListExecute).toHaveBeenCalledWith({
      filters: { userId: 'user-1' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getResumesList throws mapped error when use case fails', async () => {
    mockGetResumesListExecute.mockResolvedValue(failureResult(new ValidationError('Invalid filters')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedQuery: { limit: 10, page: 1 },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumesList(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getResumeById maps request and returns resume', async () => {
    mockGetResumeByIdExecute.mockResolvedValue(successResult({ id: 'resume-1' }));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
    };
    const res = buildResponse();

    await resumeController.getResumeById(req, res);

    expect(mockGetResumeByIdExecute).toHaveBeenCalledWith({
      resumeId: 'resume-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getResumeById maps not found failure to 404', async () => {
    mockGetResumeByIdExecute.mockResolvedValue(failureResult(new NotFoundError('Resume not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'missing-resume' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumeById(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('getResumeSnapshots maps filters and returns paginated data', async () => {
    mockGetResumeSnapshotsExecute.mockResolvedValue(
      successResult({
        snapshots: [{ id: 'snapshot-1' }],
        total: 1,
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    await resumeController.getResumeSnapshots(req, res);

    expect(mockGetResumeSnapshotsExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { userId: 'user-1', resumeId: 'resume-1' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getResumeSnapshots throws mapped error when use case fails', async () => {
    mockGetResumeSnapshotsExecute.mockResolvedValue(
      failureResult(new ValidationError('Invalid snapshots filter'))
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumeSnapshots(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getResumeExports maps status filter and returns paginated data', async () => {
    mockGetResumeExportsExecute.mockResolvedValue(
      successResult({
        exports: [{ id: 'export-1' }],
        total: 1,
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: { page: 1, limit: 10, status: 'DONE' },
    };
    const res = buildResponse();

    await resumeController.getResumeExports(req, res);

    expect(mockGetResumeExportsExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      filters: { userId: 'user-1', resumeId: 'resume-1', status: 'DONE' },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getResumeExports throws mapped error when use case fails', async () => {
    mockGetResumeExportsExecute.mockResolvedValue(
      failureResult(new ValidationError('Invalid exports filter'))
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumeExports(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getExportStatus maps user and export id', async () => {
    mockGetExportStatusExecute.mockResolvedValue(successResult({ status: 'PENDING' }));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { exportId: 'export-1' },
    };
    const res = buildResponse();

    await resumeController.getExportStatus(req, res);

    expect(mockGetExportStatusExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      exportId: 'export-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getExportStatus throws mapped error when use case fails', async () => {
    mockGetExportStatusExecute.mockResolvedValue(failureResult(new NotFoundError('Export not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { exportId: 'missing-export' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getExportStatus(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('retryFailedExport maps user and export id', async () => {
    mockRetryFailedExportExecute.mockResolvedValue(
      successResult({ exportId: 'export-1', status: 'PENDING' })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { exportId: 'export-1' },
    };
    const res = buildResponse();

    await resumeController.retryFailedExport(req, res);

    expect(mockRetryFailedExportExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      exportId: 'export-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('retryFailedExport throws mapped error when use case fails', async () => {
    mockRetryFailedExportExecute.mockResolvedValue(
      failureResult(new ValidationError('Retry not allowed'))
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { exportId: 'export-1' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.retryFailedExport(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('retryFailedExportEmailJob maps user and failed job id', async () => {
    mockRetryFailedExportEmailJobExecute.mockResolvedValue(
      successResult({
        failedJobId: 'log-1',
        exportId: 'export-1',
        to: 'person@example.com',
        reason: 'free-tier-export',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { jobId: 'log-1' },
    };
    const res = buildResponse();

    await resumeController.retryFailedExportEmailJob(req, res);

    expect(mockRetryFailedExportEmailJobExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      failedJobId: 'log-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('retryFailedExportEmailJob throws mapped error when use case fails', async () => {
    mockRetryFailedExportEmailJobExecute.mockResolvedValue(
      failureResult(new NotFoundError('Failed export email job not found'))
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { jobId: 'log-1' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.retryFailedExportEmailJob(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('updateResume maps optional payload and returns success', async () => {
    mockUpdateResumeExecute.mockResolvedValue(
      successResult({
        id: 'resume-1',
        name: 'Updated Resume',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: {
        name: 'Updated Resume',
        templateId: 'modern',
        data: {
          meta: { title: 'Resume', language: 'en' },
          sections: {
            s1: { type: 'summary', content: { text: 'About me' } },
          },
        },
      },
    };
    const res = buildResponse();

    await resumeController.updateResume(req, res);

    expect(mockUpdateResumeExecute).toHaveBeenCalledWith({
      resumeId: 'resume-1',
      userId: 'user-1',
      name: 'Updated Resume',
      data: {
        meta: { title: 'Resume', language: 'en' },
        sections: {
          s1: { type: 'summary', content: { text: 'About me' } },
        },
      },
      templateId: 'modern',
      templateVersion: undefined,
      themeConfig: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Resume updated successfully',
      })
    );
  });

  it('updateResume maps without data and keeps normalized data undefined', async () => {
    mockUpdateResumeExecute.mockResolvedValue(
      successResult({
        id: 'resume-1',
        name: 'Updated Resume',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: {
        name: 'Updated Resume',
      },
    };
    const res = buildResponse();

    await resumeController.updateResume(req, res);

    expect(mockUpdateResumeExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        data: undefined,
      })
    );
  });

  it('updateResume throws mapped error when use case fails', async () => {
    mockUpdateResumeExecute.mockResolvedValue(failureResult(new NotFoundError('Resume not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'missing-resume' },
      parsedBody: {
        name: 'Updated Resume',
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.updateResume(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('enqueueExport rejects non-store flow and does not call enqueue use case', async () => {
    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: { store: false },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.enqueueExport(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
    expect(mockEnqueueResumeExportExecute).not.toHaveBeenCalled();
  });

  it('enqueueExport runs use case and returns started response', async () => {
    mockEnqueueResumeExportExecute.mockResolvedValue(
      successResult({
        exportId: 'export-1',
        status: 'PENDING',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: { store: true },
    };
    const res = buildResponse();

    await resumeController.enqueueExport(req, res);

    expect(mockEnqueueResumeExportExecute).toHaveBeenCalledWith({
      user: { id: 'user-1', planId: 'plan-1' },
      resumeId: 'resume-1',
      idempotencyKey: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Export started',
      })
    );
  });

  it('enqueueExport throws mapped error when use case fails', async () => {
    mockEnqueueResumeExportExecute.mockResolvedValue(failureResult(new ValidationError('Quota exceeded')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: { store: true },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.enqueueExport(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('enqueueExport forwards idempotencyKey when provided', async () => {
    mockEnqueueResumeExportExecute.mockResolvedValue(
      successResult({
        exportId: 'export-1',
        delivery: 'download',
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedBody: { store: true, idempotencyKey: 'idem-key-2026-02-14-1' },
    };
    const res = buildResponse();

    await resumeController.enqueueExport(req, res);

    expect(mockEnqueueResumeExportExecute).toHaveBeenCalledWith({
      user: { id: 'user-1', planId: 'plan-1' },
      resumeId: 'resume-1',
      idempotencyKey: 'idem-key-2026-02-14-1',
    });
  });

  it('exportResume sends PDF response payload', async () => {
    const pdfBuffer = Buffer.from('pdf-content');
    mockExportResumeExecute.mockResolvedValue(successResult({ pdfBuffer }));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
    };
    const res = buildResponse();

    await resumeController.exportResume(req, res);

    expect(mockExportResumeExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      resumeId: 'resume-1',
    });
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="resume-resume-1.pdf"'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(pdfBuffer);
  });

  it('exportResume maps not-found failures to 404', async () => {
    mockExportResumeExecute.mockResolvedValue(failureResult(new NotFoundError('Resume not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'missing-resume' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.exportResume(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('getResumeExportStatus maps ids and user', async () => {
    mockGetResumeExportStatusExecute.mockResolvedValue(successResult({ status: 'DONE' }));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1', exportId: 'export-1' },
    };
    const res = buildResponse();

    await resumeController.getResumeExportStatus(req, res);

    expect(mockGetResumeExportStatusExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      resumeId: 'resume-1',
      exportId: 'export-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getResumeExportStatus throws mapped error when use case fails', async () => {
    mockGetResumeExportStatusExecute.mockResolvedValue(
      failureResult(new NotFoundError('Export not found'))
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1', exportId: 'missing-export' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.getResumeExportStatus(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('deleteResume maps request and returns success response', async () => {
    mockDeleteResumeExecute.mockResolvedValue(successResult({ id: 'resume-1' }));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
    };
    const res = buildResponse();

    await resumeController.deleteResume(req, res);

    expect(mockDeleteResumeExecute).toHaveBeenCalledWith({
      resumeId: 'resume-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Resume deleted successfully',
      })
    );
  });

  it('deleteResume throws mapped error when use case fails', async () => {
    mockDeleteResumeExecute.mockResolvedValue(failureResult(new NotFoundError('Resume not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'missing-resume' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.deleteResume(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('setDefaultResume maps request and returns updated resume', async () => {
    mockSetDefaultResumeExecute.mockResolvedValue(
      successResult({
        id: 'resume-1',
        isDefault: true,
      })
    );

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'resume-1' },
    };
    const res = buildResponse();

    await resumeController.setDefaultResume(req, res);

    expect(mockSetDefaultResumeExecute).toHaveBeenCalledWith({
      resumeId: 'resume-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Default resume updated successfully',
      })
    );
  });

  it('setDefaultResume throws mapped error when use case fails', async () => {
    mockSetDefaultResumeExecute.mockResolvedValue(failureResult(new NotFoundError('Resume not found')));

    const req = {
      user: { id: 'user-1', planId: 'plan-1' },
      parsedParams: { resumeId: 'missing-resume' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await resumeController.setDefaultResume(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });
});
