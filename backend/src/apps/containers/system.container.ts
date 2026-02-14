import { systemHealthService, systemLogQueryRepository } from '@/apps/container.shared';
import { GetExportOpsMetricsUseCase } from '@/modules/system/application/use-cases/get-export-ops-metrics/get-export-ops-metrics.use-case';
import { GetHealthCheckUseCase } from '@/modules/system/application/use-cases/get-health-check/get-health-check.use-case';

const getHealthCheckUseCase = new GetHealthCheckUseCase(systemHealthService);
const getExportOpsMetricsUseCase = new GetExportOpsMetricsUseCase(systemLogQueryRepository);

const systemContainer = {
  getHealthCheckUseCase,
  getExportOpsMetricsUseCase,
};

export { systemContainer };
