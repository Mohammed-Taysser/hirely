describe('apps/routes', () => {
  it('mounts all module routers under /api', async () => {
    jest.resetModules();

    const apiRouter = { use: jest.fn() };
    const Router = jest.fn(() => apiRouter);

    const systemRoutes = jest.fn();
    const authRoutes = jest.fn();
    const auditRoutes = jest.fn();
    const planRoutes = jest.fn();
    const resumeTemplateRoutes = jest.fn();
    const resumeRoutes = jest.fn();
    const userRoutes = jest.fn();

    jest.doMock('express', () => ({
      __esModule: true,
      default: {
        Router,
      },
    }));

    jest.doMock('@dist/modules/system/presentation/system.route', () => ({
      __esModule: true,
      default: systemRoutes,
    }));
    jest.doMock('@dist/modules/auth/presentation/auth.route', () => ({
      __esModule: true,
      default: authRoutes,
    }));
    jest.doMock('@dist/modules/audit/presentation/audit.route', () => ({
      __esModule: true,
      default: auditRoutes,
    }));
    jest.doMock('@dist/modules/plan/presentation/plan.route', () => ({
      __esModule: true,
      default: planRoutes,
    }));
    jest.doMock('@dist/modules/resumeTemplate/presentation/resumeTemplate.route', () => ({
      __esModule: true,
      default: resumeTemplateRoutes,
    }));
    jest.doMock('@dist/modules/resume/presentation/resume.route', () => ({
      __esModule: true,
      default: resumeRoutes,
    }));
    jest.doMock('@dist/modules/user/presentation/user.route', () => ({
      __esModule: true,
      default: userRoutes,
    }));

    const { registerApiRoutes } = await import('@dist/apps/routes');

    const app = { use: jest.fn() };
    registerApiRoutes(app);

    expect(Router).toHaveBeenCalledTimes(1);
    expect(apiRouter.use).toHaveBeenNthCalledWith(1, '/', systemRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(2, '/auth', authRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(3, '/audit-logs', auditRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(4, '/plans', planRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(5, '/resume-templates', resumeTemplateRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(6, '/resumes', resumeRoutes);
    expect(apiRouter.use).toHaveBeenNthCalledWith(7, '/users', userRoutes);
    expect(app.use).toHaveBeenCalledWith('/api', apiRouter);
  });
});
