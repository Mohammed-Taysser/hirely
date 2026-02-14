import { GetAuditLogsUseCase } from '@dist/modules/audit/application/use-cases/get-audit-logs/get-audit-logs.use-case';
import { UnexpectedError } from '@dist/modules/shared/application/app-error';

describe('GetAuditLogsUseCase', () => {
  it('returns audit logs for requested entity', async () => {
    const auditLogQueryRepository = {
      findByEntity: jest.fn().mockResolvedValue({
        logs: [{ id: 'log-1', entityType: 'resume', entityId: 'resume-1' }],
        total: 1,
      }),
    };

    const useCase = new GetAuditLogsUseCase(auditLogQueryRepository);
    const result = await useCase.execute({
      entityType: 'resume',
      entityId: '0d670652-a2a5-4c87-b78f-0cff94ee1df9',
      page: 1,
      limit: 10,
    });

    expect(result.isSuccess).toBe(true);
    expect(auditLogQueryRepository.findByEntity).toHaveBeenCalledWith({
      entityType: 'resume',
      entityId: '0d670652-a2a5-4c87-b78f-0cff94ee1df9',
      page: 1,
      limit: 10,
    });
    expect(result.getValue().total).toBe(1);
  });

  it('returns unexpected error when repository throws', async () => {
    const auditLogQueryRepository = {
      findByEntity: jest.fn().mockRejectedValue(new Error('db failed')),
    };

    const useCase = new GetAuditLogsUseCase(auditLogQueryRepository);
    const result = await useCase.execute({
      entityType: 'resume',
      entityId: '0d670652-a2a5-4c87-b78f-0cff94ee1df9',
      page: 1,
      limit: 10,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
