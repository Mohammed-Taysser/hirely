import { failureResult, successResult } from '../../helpers/test-fixtures';
import { NotFoundError, ValidationError } from '@dist/modules/shared/application/app-error';

const mockGetPlansExecute = jest.fn();
const mockGetPlanByIdExecute = jest.fn();
const mockCreatePlanExecute = jest.fn();
const mockUpdatePlanExecute = jest.fn();
const mockDeletePlanExecute = jest.fn();

jest.mock('@dist/apps/container', () => ({
  planContainer: {
    getPlansUseCase: { execute: (...args: unknown[]) => mockGetPlansExecute(...args) },
    getPlanByIdUseCase: { execute: (...args: unknown[]) => mockGetPlanByIdExecute(...args) },
    createPlanUseCase: { execute: (...args: unknown[]) => mockCreatePlanExecute(...args) },
    updatePlanUseCase: { execute: (...args: unknown[]) => mockUpdatePlanExecute(...args) },
    deletePlanUseCase: { execute: (...args: unknown[]) => mockDeletePlanExecute(...args) },
  },
}));

let planController: typeof import('@dist/modules/plan/presentation/plan.controller').default;

const buildResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('plan controller integration', () => {
  beforeAll(async () => {
    ({ default: planController } = await import('@dist/modules/plan/presentation/plan.controller'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getPlans responds with paginated payload on success', async () => {
    mockGetPlansExecute.mockResolvedValue(
      successResult({ plans: [{ id: 'plan-1', code: 'FREE', name: 'Free' }], total: 1 })
    );

    const req = {
      parsedQuery: {
        page: 1,
        limit: 10,
        code: 'FREE',
        name: 'Free',
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };
    const res = buildResponse();

    await planController.getPlans(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Plans fetched successfully',
      })
    );
    expect(mockGetPlansExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
        filters: expect.objectContaining({
          code: 'FREE',
          name: 'Free',
          createdAt: expect.any(Object),
        }),
      })
    );
  });

  it('getPlanById throws mapped http error when not found', async () => {
    mockGetPlanByIdExecute.mockResolvedValue(failureResult(new NotFoundError('Plan not found')));

    const req = {
      parsedParams: { planId: 'b636a305-aeb4-488d-8799-e65b2f167582' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await planController.getPlanById(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('getPlans throws mapped error when use case fails', async () => {
    mockGetPlansExecute.mockResolvedValue(failureResult(new ValidationError('bad filter')));

    const req = {
      parsedQuery: { page: 1, limit: 10 },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await planController.getPlans(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getPlanById responds with 200 and plan payload', async () => {
    mockGetPlanByIdExecute.mockResolvedValue(
      successResult({ id: 'plan-1', code: 'FREE', name: 'Free' })
    );

    const req = {
      parsedParams: { planId: 'plan-1' },
    };
    const res = buildResponse();

    await planController.getPlanById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Plan fetched successfully',
      })
    );
  });

  it('createPlan maps payload and responds with 201', async () => {
    mockCreatePlanExecute.mockResolvedValue(
      successResult({
        id: 'plan-2',
        code: 'PRO',
        name: 'Pro',
      })
    );

    const req = {
      parsedBody: {
        code: 'PRO',
        name: 'Pro',
        description: 'Pro plan',
        limits: {
          maxResumes: 20,
          maxExports: 100,
          dailyUploadMb: 500,
        },
      },
    };
    const res = buildResponse();

    await planController.createPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockCreatePlanExecute).toHaveBeenCalledWith({
      code: 'PRO',
      name: 'Pro',
      description: 'Pro plan',
      limits: {
        create: {
          maxResumes: 20,
          maxExports: 100,
          dailyUploadMb: 500,
        },
      },
    });
  });

  it('createPlan throws mapped error when use case fails', async () => {
    mockCreatePlanExecute.mockResolvedValue(failureResult(new ValidationError('invalid data')));

    const req = {
      parsedBody: {
        code: 'PRO',
        name: 'Pro',
        description: 'Pro plan',
        limits: {
          maxResumes: 20,
          maxExports: 100,
          dailyUploadMb: 500,
        },
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await planController.createPlan(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('updatePlan maps payload and responds with 200', async () => {
    mockUpdatePlanExecute.mockResolvedValue(
      successResult({
        id: 'plan-2',
        code: 'PRO',
        name: 'Pro Updated',
      })
    );

    const req = {
      parsedParams: { planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a' },
      parsedBody: {
        name: 'Pro Updated',
        limits: {
          maxResumes: 30,
          maxExports: 120,
          dailyUploadMb: 700,
        },
      },
    };
    const res = buildResponse();

    await planController.updatePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUpdatePlanExecute).toHaveBeenCalledWith({
      planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a',
      data: {
        code: undefined,
        name: 'Pro Updated',
        description: undefined,
        limits: {
          update: {
            maxResumes: 30,
            maxExports: 120,
            dailyUploadMb: 700,
          },
        },
      },
    });
  });

  it('updatePlan sends undefined limits when payload has no limits', async () => {
    mockUpdatePlanExecute.mockResolvedValue(
      successResult({
        id: 'plan-2',
        code: 'PRO',
        name: 'Pro Updated',
      })
    );

    const req = {
      parsedParams: { planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a' },
      parsedBody: {
        name: 'Pro Updated',
      },
    };
    const res = buildResponse();

    await planController.updatePlan(req, res);

    expect(mockUpdatePlanExecute).toHaveBeenCalledWith({
      planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a',
      data: {
        code: undefined,
        name: 'Pro Updated',
        description: undefined,
        limits: undefined,
      },
    });
  });

  it('updatePlan throws mapped error when use case fails', async () => {
    mockUpdatePlanExecute.mockResolvedValue(failureResult(new ValidationError('invalid update')));

    const req = {
      parsedParams: { planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a' },
      parsedBody: {
        name: 'Pro Updated',
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await planController.updatePlan(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('deletePlan responds with 200 and deleted plan', async () => {
    mockDeletePlanExecute.mockResolvedValue(
      successResult({
        id: 'plan-2',
        code: 'PRO',
        name: 'Pro',
      })
    );

    const req = {
      parsedParams: { planId: '5c43020f-f9b4-4637-a4ca-d666073ff11a' },
    };
    const res = buildResponse();

    await planController.deletePlan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Plan deleted successfully',
      })
    );
  });

  it('deletePlan throws mapped error when use case fails', async () => {
    mockDeletePlanExecute.mockResolvedValue(failureResult(new NotFoundError('Plan not found')));

    const req = {
      parsedParams: { planId: 'missing-plan' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await planController.deletePlan(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });
});
