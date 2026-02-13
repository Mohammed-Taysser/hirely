import { systemHealthService } from '@/apps/container.shared';
import { GetHealthCheckUseCase } from '@/modules/system/application/use-cases/get-health-check/get-health-check.use-case';

const getHealthCheckUseCase = new GetHealthCheckUseCase(systemHealthService);

const systemContainer = {
  getHealthCheckUseCase,
};

export { systemContainer };
