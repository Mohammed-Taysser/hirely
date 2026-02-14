import { CleanupExpiredExportsUseCase } from '@dist/modules/resume/application/use-cases/cleanup-expired-exports/cleanup-expired-exports.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('CleanupExpiredExportsUseCase', () => {
  it('deletes expired exports and storage objects', async () => {
    const repository = {
      findExpired: jest.fn().mockResolvedValue([
        { id: 'exp-1', userId: 'user-1', url: 'u1/exp-1.pdf', expiresAt: new Date() },
        { id: 'exp-2', userId: 'user-1', url: null, expiresAt: new Date() },
      ]),
      deleteByIds: jest.fn().mockResolvedValue(2),
    };
    const storage = {
      deleteObject: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CleanupExpiredExportsUseCase(repository as never, storage as never);
    const result = await useCase.execute({ batchSize: 50 });

    expect(result.isSuccess).toBe(true);
    expect(storage.deleteObject).toHaveBeenCalledWith('u1/exp-1.pdf');
    expect(repository.deleteByIds).toHaveBeenCalledWith(['exp-1', 'exp-2']);
    expect(result.getValue()).toEqual(
      expect.objectContaining({
        scanned: 2,
        deletedRecords: 2,
        deletedFiles: 1,
        wouldDeleteRecords: 2,
        wouldDeleteFiles: 1,
        dryRun: false,
        failed: 0,
      })
    );
  });

  it('keeps failed file deletions for retry by not deleting the record', async () => {
    const repository = {
      findExpired: jest.fn().mockResolvedValue([
        { id: 'exp-1', userId: 'user-1', url: 'u1/exp-1.pdf', expiresAt: new Date() },
        { id: 'exp-2', userId: 'user-2', url: 'u2/exp-2.pdf', expiresAt: new Date() },
      ]),
      deleteByIds: jest.fn().mockResolvedValue(1),
    };
    const storage = {
      deleteObject: jest
        .fn()
        .mockRejectedValueOnce(new Error('storage unavailable'))
        .mockResolvedValueOnce(undefined),
    };

    const useCase = new CleanupExpiredExportsUseCase(repository as never, storage as never);
    const result = await useCase.execute({ batchSize: 50 });

    expect(result.isSuccess).toBe(true);
    expect(repository.deleteByIds).toHaveBeenCalledWith(['exp-2']);
    expect(result.getValue().failed).toBe(1);
    expect(result.getValue().failures[0]).toEqual(
      expect.objectContaining({
        exportId: 'exp-1',
        userId: 'user-1',
        reason: 'storage unavailable',
      })
    );
  });

  it('supports dry run without deleting files or records', async () => {
    const repository = {
      findExpired: jest.fn().mockResolvedValue([
        { id: 'exp-1', userId: 'user-1', url: 'u1/exp-1.pdf', expiresAt: new Date() },
        { id: 'exp-2', userId: 'user-1', url: null, expiresAt: new Date() },
      ]),
      deleteByIds: jest.fn(),
    };
    const storage = {
      deleteObject: jest.fn(),
    };

    const useCase = new CleanupExpiredExportsUseCase(repository as never, storage as never);
    const result = await useCase.execute({ batchSize: 50, dryRun: true });

    expect(result.isSuccess).toBe(true);
    expect(storage.deleteObject).not.toHaveBeenCalled();
    expect(repository.deleteByIds).not.toHaveBeenCalled();
    expect(result.getValue()).toEqual(
      expect.objectContaining({
        scanned: 2,
        deletedRecords: 0,
        deletedFiles: 0,
        wouldDeleteRecords: 2,
        wouldDeleteFiles: 1,
        dryRun: true,
      })
    );
  });

  it('wraps unexpected errors', async () => {
    const repository = {
      findExpired: jest.fn().mockRejectedValue(new Error('db down')),
      deleteByIds: jest.fn(),
    };
    const storage = {
      deleteObject: jest.fn(),
    };

    const useCase = new CleanupExpiredExportsUseCase(repository as never, storage as never);
    const result = await useCase.execute({ batchSize: 50 });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
