import { GetAuditLogsRequestDto } from './get-audit-logs.dto';

import {
  AuditLogListResult,
  IAuditLogQueryRepository,
} from '@/modules/audit/application/repositories/audit-log.query.repository.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetAuditLogsResponse = Result<AuditLogListResult, UnexpectedError>;

export class GetAuditLogsUseCase implements UseCase<GetAuditLogsRequestDto, GetAuditLogsResponse> {
  constructor(private readonly auditLogQueryRepository: IAuditLogQueryRepository) {}

  async execute(request: GetAuditLogsRequestDto): Promise<GetAuditLogsResponse> {
    try {
      const result = await this.auditLogQueryRepository.findByEntity({
        entityType: request.entityType,
        entityId: request.entityId,
        page: request.page,
        limit: request.limit,
      });

      return Result.ok(result);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
