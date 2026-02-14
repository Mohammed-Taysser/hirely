import { successResult } from '../../helpers/test-fixtures';
import { runMiddleware } from '../helpers/http-middleware.helper';
import { findRouteLayer } from '../helpers/route-inspector.helper';

const mockGetPlansExecute = jest.fn();
const mockGetPlanByIdExecute = jest.fn();
const mockCreatePlanExecute = jest.fn();
const mockUpdatePlanExecute = jest.fn();
const mockDeletePlanExecute = jest.fn();

type SetupPlanRouter = {
  planRoutes: { stack?: unknown[] };
  renderErrorResponse: (err: unknown, req: Record<string, unknown>) => {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const setupRouter = async (): Promise<SetupPlanRouter> => {
  jest.resetModules();
  mockGetPlansExecute.mockReset();
  mockGetPlanByIdExecute.mockReset();
  mockCreatePlanExecute.mockReset();
  mockUpdatePlanExecute.mockReset();
  mockDeletePlanExecute.mockReset();

  jest.doMock('@dist/apps/container', () => ({
    planContainer: {
      getPlansUseCase: { execute: (...args: unknown[]) => mockGetPlansExecute(...args) },
      getPlanByIdUseCase: { execute: (...args: unknown[]) => mockGetPlanByIdExecute(...args) },
      createPlanUseCase: { execute: (...args: unknown[]) => mockCreatePlanExecute(...args) },
      updatePlanUseCase: { execute: (...args: unknown[]) => mockUpdatePlanExecute(...args) },
      deletePlanUseCase: { execute: (...args: unknown[]) => mockDeletePlanExecute(...args) },
    },
  }));

  jest.doMock('@dist/middleware/authenticate.middleware', () => ({
    __esModule: true,
    default: (_req: unknown, _res: unknown, next: (err?: unknown) => void) => next(),
  }));

  const { default: planRoutes } = await import('@dist/modules/plan/presentation/plan.route');
  const { default: errorHandlerMiddleware } = await import('@dist/middleware/error-handler.middleware');

  const renderErrorResponse = (err: unknown, req: Record<string, unknown>) => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    errorHandlerMiddleware(err, req, response, (() => {}) as never);
    return response;
  };

  return { planRoutes, renderErrorResponse };
};

describe('plan controller http integration', () => {
  it('returns 400 for invalid query payload before controller', async () => {
    const { planRoutes, renderErrorResponse } = await setupRouter();
    const route = findRouteLayer(planRoutes, 'get', '/');
    const req = {
      body: {},
      params: {},
      query: { page: '0', limit: '10' },
      method: 'GET',
      originalUrl: '/api/plans',
    };

    await runMiddleware(route.stack[0].handle as never, req);
    const validationError = await runMiddleware(route.stack[1].handle as never, req);
    const response = renderErrorResponse(validationError, req);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(mockGetPlansExecute).not.toHaveBeenCalled();
  });

  it('returns 200 with paginated plans when query is valid', async () => {
    const { planRoutes } = await setupRouter();
    const route = findRouteLayer(planRoutes, 'get', '/');
    mockGetPlansExecute.mockResolvedValue(
      successResult({
        plans: [{ id: 'plan-1', code: 'FREE', name: 'Free' }],
        total: 1,
      })
    );

    const req = {
      body: {},
      params: {},
      query: { page: '1', limit: '10' },
      method: 'GET',
      originalUrl: '/api/plans',
    };
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await runMiddleware(route.stack[0].handle as never, req);
    const validationError = await runMiddleware(route.stack[1].handle as never, req);
    expect(validationError).toBeUndefined();
    await (route.stack[2].handle as (req: unknown, res: unknown) => Promise<void>)(req, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Plans fetched successfully',
      })
    );
    expect(mockGetPlansExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
      })
    );
  });

});
