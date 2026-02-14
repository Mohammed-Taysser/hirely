import { AUTH_CREDENTIAL, failureResult, successResult } from '../../helpers/test-fixtures';
import { NotFoundError, ValidationError } from '@dist/modules/shared/application/app-error';

const mockGetUsersExecute = jest.fn();
const mockGetUsersListExecute = jest.fn();
const mockUpdateUserExecute = jest.fn();
const mockDeleteUserExecute = jest.fn();
const mockChangeUserPlanExecute = jest.fn();
const mockGetUserByIdExecute = jest.fn();
const mockGetUserPlanUsageExecute = jest.fn();
const mockCreateUserWithPlanExecute = jest.fn();

jest.mock('@dist/apps/container', () => ({
  userContainer: {
    getUsersUseCase: { execute: (...args: unknown[]) => mockGetUsersExecute(...args) },
    getUsersListUseCase: { execute: (...args: unknown[]) => mockGetUsersListExecute(...args) },
    updateUserUseCase: { execute: (...args: unknown[]) => mockUpdateUserExecute(...args) },
    deleteUserUseCase: { execute: (...args: unknown[]) => mockDeleteUserExecute(...args) },
    changeUserPlanUseCase: { execute: (...args: unknown[]) => mockChangeUserPlanExecute(...args) },
    getUserByIdQueryUseCase: { execute: (...args: unknown[]) => mockGetUserByIdExecute(...args) },
    getUserPlanUsageUseCase: { execute: (...args: unknown[]) => mockGetUserPlanUsageExecute(...args) },
    createUserWithPlanUseCase: {
      execute: (...args: unknown[]) => mockCreateUserWithPlanExecute(...args),
    },
  },
}));

let userController: typeof import('@dist/modules/user/presentation/user.controller').default;

const buildResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('user controller integration', () => {
  beforeAll(async () => {
    ({ default: userController } = await import('@dist/modules/user/presentation/user.controller'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updateUser throws forbidden when auth user does not match target user', async () => {
    const req = {
      parsedBody: { name: 'Updated Name' },
      parsedParams: { userId: '8d55f2fe-c68f-49a2-ac48-80d4854b4f1b' },
      user: { id: 'other-user-id' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.updateUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();

    expect((thrown as { statusCode?: number }).statusCode).toBe(403);
    expect(mockUpdateUserExecute).not.toHaveBeenCalled();
  });

  it('createUser responds with 201 on success', async () => {
    mockCreateUserWithPlanExecute.mockResolvedValue(
      successResult({ id: 'user-2', name: 'Created User', email: 'created@example.com' })
    );

    const req = {
      parsedBody: {
        name: 'Created User',
        email: 'created@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    await userController.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'User created successfully',
      })
    );
  });

  it('createUser throws mapped error when use case fails', async () => {
    mockCreateUserWithPlanExecute.mockResolvedValue(
      failureResult(new ValidationError('User already exists'))
    );

    const req = {
      parsedBody: {
        name: 'Created User',
        email: 'created@example.com',
        password: AUTH_CREDENTIAL,
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.createUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getProfile responds with authenticated user profile', async () => {
    const req = {
      user: {
        id: 'user-1',
        name: 'Auth User',
        email: 'auth@example.com',
        planId: 'plan-1',
        isVerified: true,
      },
    };
    const res = buildResponse();

    await userController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'User fetched successfully',
        data: expect.objectContaining({
          id: 'user-1',
          email: 'auth@example.com',
        }),
      })
    );
  });

  it('getProfile normalizes missing isVerified to false', async () => {
    const req = {
      user: {
        id: 'user-1',
        name: 'Auth User',
        email: 'auth@example.com',
        planId: 'plan-1',
      },
    };
    const res = buildResponse();

    await userController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          isVerified: false,
        }),
      })
    );
  });

  it('getPlanUsage returns usage payload for authenticated user', async () => {
    mockGetUserPlanUsageExecute.mockResolvedValue(
      successResult({
        plan: { id: 'plan-1', code: 'PRO', name: 'Pro' },
        limits: { maxResumes: 10, maxExports: 20, dailyUploadMb: 100, dailyUploadBytes: 104857600 },
        usage: { resumesUsed: 2, exportsUsed: 5, dailyUploadUsedBytes: 1024 },
        remaining: { resumes: 8, exports: 15, dailyUploadBytes: 104856576 },
      })
    );

    const req = { user: { id: 'user-1' } };
    const res = buildResponse();

    await userController.getPlanUsage(req, res);

    expect(mockGetUserPlanUsageExecute).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'User plan usage fetched successfully',
      })
    );
  });

  it('getPlanUsage throws mapped error when use case fails', async () => {
    mockGetUserPlanUsageExecute.mockResolvedValue(
      failureResult(new NotFoundError('User plan not found'))
    );

    const req = { user: { id: 'user-1' } };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.getPlanUsage(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('getUsers returns paginated users and builds filters', async () => {
    mockGetUsersExecute.mockResolvedValue(
      successResult({
        users: [{ id: 'user-1', email: 'john@example.com' }],
        total: 1,
      })
    );

    const req = {
      parsedQuery: {
        page: 1,
        limit: 10,
        name: 'John',
        email: 'john@example.com',
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };
    const res = buildResponse();

    await userController.getUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockGetUsersExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
        filters: expect.objectContaining({
          name: 'John',
          email: 'john@example.com',
          createdAt: expect.any(Object),
        }),
      })
    );
  });

  it('getUsers throws mapped error when use case fails', async () => {
    mockGetUsersExecute.mockResolvedValue(failureResult(new ValidationError('Invalid query')));

    const req = {
      parsedQuery: {
        page: 1,
        limit: 10,
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.getUsers(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getUsersList returns basic list', async () => {
    mockGetUsersListExecute.mockResolvedValue(
      successResult([{ id: 'user-1', name: 'John Doe' }])
    );

    const req = {
      parsedQuery: {
        name: 'John',
      },
    };
    const res = buildResponse();

    await userController.getUsersList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Users fetched successfully',
      })
    );
  });

  it('getUsersList throws mapped error when use case fails', async () => {
    mockGetUsersListExecute.mockResolvedValue(failureResult(new ValidationError('Invalid filter')));

    const req = {
      parsedQuery: {
        name: 'John',
      },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.getUsersList(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(400);
  });

  it('getUserById returns user dto', async () => {
    mockGetUserByIdExecute.mockResolvedValue(
      successResult({ id: 'user-1', email: 'john@example.com' })
    );

    const req = {
      params: { userId: 'user-1' },
    };
    const res = buildResponse();

    await userController.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockGetUserByIdExecute).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('getUserById throws mapped error when use case fails', async () => {
    mockGetUserByIdExecute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = {
      params: { userId: 'missing-user' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.getUserById(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('updateUser succeeds when auth user matches target user', async () => {
    mockUpdateUserExecute.mockResolvedValue(
      successResult({ id: 'user-1', email: 'updated@example.com' })
    );

    const req = {
      parsedBody: { name: 'Updated Name', email: 'updated@example.com' },
      parsedParams: { userId: 'user-1' },
      user: { id: 'user-1' },
    };
    const res = buildResponse();

    await userController.updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockUpdateUserExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Updated Name',
      email: 'updated@example.com',
    });
  });

  it('updateUser throws mapped error when use case fails', async () => {
    mockUpdateUserExecute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = {
      parsedBody: { name: 'Updated Name', email: 'updated@example.com' },
      parsedParams: { userId: 'missing-user' },
      user: { id: 'missing-user' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.updateUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('deleteUser throws forbidden when auth user does not match target user', async () => {
    const req = {
      parsedParams: { userId: 'user-1' },
      user: { id: 'other-user-id' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.deleteUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeDefined();
    expect((thrown as { statusCode?: number }).statusCode).toBe(403);
    expect(mockDeleteUserExecute).not.toHaveBeenCalled();
  });

  it('deleteUser succeeds when auth user matches target user', async () => {
    mockDeleteUserExecute.mockResolvedValue(successResult({ id: 'user-1' }));

    const req = {
      parsedParams: { userId: 'user-1' },
      user: { id: 'user-1' },
    };
    const res = buildResponse();

    await userController.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockDeleteUserExecute).toHaveBeenCalledWith({ userId: 'user-1' });
  });

  it('deleteUser throws mapped error when use case fails', async () => {
    mockDeleteUserExecute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = {
      parsedParams: { userId: 'missing-user' },
      user: { id: 'missing-user' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.deleteUser(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });

  it('changeUserPlan succeeds when auth user matches target user', async () => {
    mockChangeUserPlanExecute.mockResolvedValue(
      successResult({ id: 'user-1', planId: 'plan-2' })
    );

    const req = {
      parsedParams: { userId: 'user-1' },
      parsedBody: { planCode: 'PRO', scheduleAt: undefined },
      user: { id: 'user-1' },
    };
    const res = buildResponse();

    await userController.changeUserPlan(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockChangeUserPlanExecute).toHaveBeenCalledWith({
      userId: 'user-1',
      planCode: 'PRO',
      scheduleAt: undefined,
    });
  });

  it('changeUserPlan throws forbidden when auth user does not match target user', async () => {
    const req = {
      parsedParams: { userId: 'user-1' },
      parsedBody: { planCode: 'PRO', scheduleAt: undefined },
      user: { id: 'other-user-id' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.changeUserPlan(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(403);
    expect(mockChangeUserPlanExecute).not.toHaveBeenCalled();
  });

  it('changeUserPlan throws mapped error when use case fails', async () => {
    mockChangeUserPlanExecute.mockResolvedValue(failureResult(new NotFoundError('User not found')));

    const req = {
      parsedParams: { userId: 'missing-user' },
      parsedBody: { planCode: 'PRO', scheduleAt: undefined },
      user: { id: 'missing-user' },
    };
    const res = buildResponse();

    let thrown: unknown;
    try {
      await userController.changeUserPlan(req, res);
    } catch (error) {
      thrown = error;
    }

    expect((thrown as { statusCode?: number }).statusCode).toBe(404);
  });
});
