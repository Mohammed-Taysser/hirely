import { NotFoundError, UnexpectedError } from '@dist/modules/shared/application/app-error';
import { GetUserByIdQueryUseCase } from '@dist/modules/user/application/use-cases/get-user-by-id-query/get-user-by-id-query.use-case';

describe('GetUserByIdQueryUseCase', () => {
  it('returns user when found', async () => {
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' }),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new GetUserByIdQueryUseCase(userQueryRepository);
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe('user-1');
  });

  it('returns not found when user is missing', async () => {
    const userQueryRepository = {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new GetUserByIdQueryUseCase(userQueryRepository);
    const result = await useCase.execute({ userId: 'missing' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(NotFoundError);
  });

  it('returns unexpected error when repository throws', async () => {
    const userQueryRepository = {
      findById: jest.fn().mockRejectedValue(new Error('db failed')),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
      getPaginatedUsers: jest.fn(),
      getBasicUsers: jest.fn(),
    };

    const useCase = new GetUserByIdQueryUseCase(userQueryRepository);
    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
