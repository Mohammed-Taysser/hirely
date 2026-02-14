import { GetUserPlanUsageRequestDto, GetUserPlanUsageResponseDto } from './get-user-plan-usage.dto';

import { requirePlanUsageLimits } from '@/modules/plan/application/policies/plan-limit.policy';
import { IPlanLimitQueryRepository } from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';
import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { IResumeQueryRepository } from '@/modules/resume/application/repositories/resume.query.repository.interface';
import { AppError, NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { SystemActions } from '@/modules/system/application/system.actions';
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';

type GetUserPlanUsageResponse = Result<GetUserPlanUsageResponseDto, AppError>;

const getUtcDayRange = (now = new Date()) => {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

const clampToZero = (value: number): number => Math.max(0, value);

export class GetUserPlanUsageUseCase implements UseCase<
  GetUserPlanUsageRequestDto,
  GetUserPlanUsageResponse
> {
  constructor(
    private readonly userQueryRepository: IUserQueryRepository,
    private readonly planLimitQueryRepository: IPlanLimitQueryRepository,
    private readonly resumeQueryRepository: IResumeQueryRepository,
    private readonly resumeExportRepository: IResumeExportRepository,
    private readonly systemLogQueryRepository: ISystemLogQueryRepository
  ) {}

  async execute(request: GetUserPlanUsageRequestDto): Promise<GetUserPlanUsageResponse> {
    try {
      const user = await this.userQueryRepository.findById(request.userId);
      if (!user?.planId || !user.plan) {
        return Result.fail(new NotFoundError('User plan not found'));
      }

      const planLimit = await this.planLimitQueryRepository.findByPlanId(user.planId);
      const usageLimits = requirePlanUsageLimits(planLimit);

      const resumes = await this.resumeQueryRepository.getBasicResumes({ userId: request.userId });
      const exportsUsed = await this.resumeExportRepository.countByUser(request.userId);
      const { start, end } = getUtcDayRange();
      const dailyExportsUsed = await this.resumeExportRepository.countByUserInRange(
        request.userId,
        start,
        end
      );
      const dailyUploadUsedBytes = await this.resumeExportRepository.getUploadedBytesByUserInRange(
        request.userId,
        start,
        end
      );
      const dailyExportEmailsUsed = await this.systemLogQueryRepository.countByUserAndActionInRange(
        request.userId,
        SystemActions.EXPORT_EMAIL_SENT,
        start,
        end
      );
      const dailyBulkAppliesUsed = await this.systemLogQueryRepository.countByUserAndActionInRange(
        request.userId,
        SystemActions.BULK_APPLY_ENQUEUED,
        start,
        end
      );

      const resumesUsed = resumes.length;

      return Result.ok({
        plan: {
          id: user.plan.id,
          code: user.plan.code,
          name: user.plan.name,
        },
        limits: {
          maxResumes: usageLimits.maxResumes,
          maxExports: usageLimits.maxExports,
          dailyUploadMb: usageLimits.dailyUploadMb,
          dailyUploadBytes: usageLimits.dailyUploadBytes,
          dailyExports: usageLimits.dailyExports,
          dailyExportEmails: usageLimits.dailyExportEmails,
          dailyBulkApplies: usageLimits.dailyBulkApplies,
        },
        usage: {
          resumesUsed,
          exportsUsed,
          dailyExportsUsed,
          dailyUploadUsedBytes,
          dailyExportEmailsUsed,
          dailyBulkAppliesUsed,
        },
        remaining: {
          resumes: clampToZero(usageLimits.maxResumes - resumesUsed),
          exports: clampToZero(usageLimits.maxExports - exportsUsed),
          dailyExports: clampToZero(usageLimits.dailyExports - dailyExportsUsed),
          dailyUploadBytes: clampToZero(usageLimits.dailyUploadBytes - dailyUploadUsedBytes),
          dailyExportEmails: clampToZero(usageLimits.dailyExportEmails - dailyExportEmailsUsed),
          dailyBulkApplies: clampToZero(usageLimits.dailyBulkApplies - dailyBulkAppliesUsed),
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return Result.fail(error);
      }

      return Result.fail(new UnexpectedError(error));
    }
  }
}
