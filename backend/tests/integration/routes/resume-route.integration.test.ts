import { findRouteLayer } from '../helpers/route-inspector.helper';

const setup = async () => {
  jest.resetModules();

  const controller = {
    getResumesList: jest.fn(),
    getResumes: jest.fn(),
    getResumeById: jest.fn(),
    getResumeSnapshots: jest.fn(),
    getResumeExports: jest.fn(),
    getFailedExports: jest.fn(),
    getFailedExportEmailJobs: jest.fn(),
    getExportStatus: jest.fn(),
    retryFailedExport: jest.fn(),
    retryFailedExportEmailJob: jest.fn(),
    exportResume: jest.fn(),
    enqueueExport: jest.fn(),
    getResumeExportStatus: jest.fn(),
    createResume: jest.fn(),
    updateResume: jest.fn(),
    deleteResume: jest.fn(),
    setDefaultResume: jest.fn(),
  };

  const dto = {
    getResumesList: { name: 'getResumesList' },
    getResumeById: { name: 'getResumeById' },
    getResumeSnapshots: { name: 'getResumeSnapshots' },
    getResumeExports: { name: 'getResumeExports' },
    getFailedExports: { name: 'getFailedExports' },
    getFailedExportEmailJobs: { name: 'getFailedExportEmailJobs' },
    exportStatus: { name: 'exportStatus' },
    retryFailedExport: { name: 'retryFailedExport' },
    retryFailedExportEmailJob: { name: 'retryFailedExportEmailJob' },
    exportResume: { name: 'exportResume' },
    enqueueExport: { name: 'enqueueExport' },
    getResumeExportStatus: { name: 'getResumeExportStatus' },
    createResume: { name: 'createResume' },
    updateResume: { name: 'updateResume' },
    setDefaultResume: { name: 'setDefaultResume' },
  };

  const authenticateMiddleware = jest.fn();
  const validateRequest = jest.fn((schema: unknown) => {
    const middleware = jest.fn();
    (middleware as unknown as { __schema: unknown }).__schema = schema;
    return middleware;
  });

  jest.doMock('@dist/modules/resume/presentation/resume.controller', () => ({
    __esModule: true,
    default: controller,
  }));
  jest.doMock('@dist/modules/resume/presentation/resume.dto', () => ({
    __esModule: true,
    default: dto,
  }));
  jest.doMock('@dist/middleware/authenticate.middleware', () => ({
    __esModule: true,
    default: authenticateMiddleware,
  }));
  jest.doMock('@dist/middleware/validate-request.middleware', () => ({
    __esModule: true,
    default: validateRequest,
  }));

  const { default: resumeRoutes } = await import('@dist/modules/resume/presentation/resume.route');

  return { resumeRoutes, controller, dto, authenticateMiddleware };
};

describe('resume route integration', () => {
  it('all resume endpoints are protected and validated before controller', async () => {
    const { resumeRoutes, controller, dto, authenticateMiddleware } = await setup();

    const checks: Array<{
      method: string;
      path: string;
      schema: unknown;
      handler: unknown;
    }> = [
      { method: 'get', path: '/basic', schema: dto.getResumesList, handler: controller.getResumesList },
      { method: 'get', path: '/', schema: dto.getResumesList, handler: controller.getResumes },
      { method: 'get', path: '/:resumeId', schema: dto.getResumeById, handler: controller.getResumeById },
      {
        method: 'get',
        path: '/:resumeId/snapshots',
        schema: dto.getResumeSnapshots,
        handler: controller.getResumeSnapshots,
      },
      {
        method: 'get',
        path: '/:resumeId/exports',
        schema: dto.getResumeExports,
        handler: controller.getResumeExports,
      },
      {
        method: 'get',
        path: '/exports/failed',
        schema: dto.getFailedExports,
        handler: controller.getFailedExports,
      },
      {
        method: 'get',
        path: '/exports/failed-emails',
        schema: dto.getFailedExportEmailJobs,
        handler: controller.getFailedExportEmailJobs,
      },
      {
        method: 'get',
        path: '/exports/:exportId/status',
        schema: dto.exportStatus,
        handler: controller.getExportStatus,
      },
      {
        method: 'post',
        path: '/exports/:exportId/retry',
        schema: dto.retryFailedExport,
        handler: controller.retryFailedExport,
      },
      {
        method: 'post',
        path: '/exports/failed-emails/:jobId/retry',
        schema: dto.retryFailedExportEmailJob,
        handler: controller.retryFailedExportEmailJob,
      },
      {
        method: 'get',
        path: '/:resumeId/export/download',
        schema: dto.exportResume,
        handler: controller.exportResume,
      },
      {
        method: 'post',
        path: '/:resumeId/export',
        schema: dto.enqueueExport,
        handler: controller.enqueueExport,
      },
      {
        method: 'get',
        path: '/:resumeId/exports/:exportId/status',
        schema: dto.getResumeExportStatus,
        handler: controller.getResumeExportStatus,
      },
      {
        method: 'post',
        path: '/',
        schema: dto.createResume,
        handler: controller.createResume,
      },
      {
        method: 'patch',
        path: '/:resumeId',
        schema: dto.updateResume,
        handler: controller.updateResume,
      },
      {
        method: 'delete',
        path: '/:resumeId',
        schema: dto.getResumeById,
        handler: controller.deleteResume,
      },
      {
        method: 'patch',
        path: '/:resumeId/default',
        schema: dto.setDefaultResume,
        handler: controller.setDefaultResume,
      },
    ];

    for (const check of checks) {
      const route = findRouteLayer(resumeRoutes, check.method, check.path);
      expect(route.stack[0].handle).toBe(authenticateMiddleware);
      expect((route.stack[1].handle as { __schema: unknown }).__schema).toBe(check.schema);
      expect(route.stack[2].handle).toBe(check.handler);
    }
  });
});
