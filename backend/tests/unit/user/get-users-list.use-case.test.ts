import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { GetUsersListUseCase } from '@dist/modules/user/application/use-cases/get-users-list/get-users-list.use-case';

describe('GetUsersListUseCase', () => {
  it('returns basic users list', async () => {
    const userQueryRepository = {
      getBasicUsers: jest.fn().mockResolvedValue([{ id: 'user-1', email: 'john@example.com' }]),
      getPaginatedUsers: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
    };

    const useCase = new GetUsersListUseCase(userQueryRepository);
    const result = await useCase.execute({ filters: {} });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(1);
  });

  it('returns unexpected error when repository fails', async () => {
    const userQueryRepository = {
      getBasicUsers: jest.fn().mockRejectedValue(new Error('db failed')),
      getPaginatedUsers: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAuthByEmail: jest.fn(),
    };

    const useCase = new GetUsersListUseCase(userQueryRepository);
    const result = await useCase.execute({ filters: {} });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
