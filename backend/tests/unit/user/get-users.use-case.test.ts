import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { GetUsersUseCase } from '@dist/modules/user/application/use-cases/get-users/get-users.use-case';

describe('GetUsersUseCase', () => {
  it('returns paginated users', async () => {
    const userQueryRepository = {
      getPaginatedUsers: jest.fn().mockResolvedValue([
        [{ id: 'user-1', email: 'john@example.com' }],
        1,
      ]),
      getBasicUsers: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
    };

    const useCase = new GetUsersUseCase(userQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 20, filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(userQueryRepository.getPaginatedUsers).toHaveBeenCalledWith(1, 20, {});
    expect(result.getValue().total).toBe(1);
  });

  it('returns unexpected error on repository failure', async () => {
    const userQueryRepository = {
      getPaginatedUsers: jest.fn().mockRejectedValue(new Error('db failed')),
      getBasicUsers: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
    };

    const useCase = new GetUsersUseCase(userQueryRepository);
    const result = await useCase.execute({ page: 1, limit: 20, filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
