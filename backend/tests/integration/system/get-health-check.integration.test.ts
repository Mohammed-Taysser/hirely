import { GetHealthCheckUseCase } from '@dist/modules/system/application/use-cases/get-health-check/get-health-check.use-case';
import { OsSystemHealthService } from '@dist/modules/system/infrastructure/services/os-system-health.service';

describe('GetHealthCheck integration', () => {
  it('returns real OS health snapshot', async () => {
    const useCase = new GetHealthCheckUseCase(new OsSystemHealthService());

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    const snapshot = result.getValue();
    expect(['HEALTHY', 'DEGRADED', 'DOWN']).toContain(snapshot.systemHealth);
    expect(typeof snapshot.totalCpus).toBe('number');
    expect(typeof snapshot.platform).toBe('string');
    expect(typeof snapshot.uptime).toBe('number');
  });
});
