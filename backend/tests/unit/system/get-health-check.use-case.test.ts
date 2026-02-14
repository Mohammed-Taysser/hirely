import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { GetHealthCheckUseCase } from '@dist/modules/system/application/use-cases/get-health-check/get-health-check.use-case';

describe('GetHealthCheckUseCase', () => {
  it('returns snapshot from system health service', async () => {
    const systemHealthService = {
      getSnapshot: jest.fn().mockReturnValue({
        systemHealth: 'HEALTHY',
        cpu: { totalIdle: 1, totalTick: 2, cpuUsages: 50 },
        memory: { totalMem: 1024, freeMem: 512, memoryUsages: 50 },
        uptime: 100,
        platform: 'linux',
        arch: 'x64',
        hostname: 'test-host',
        release: '1',
        totalCpus: 4,
        systemType: 'Linux',
        systemVersion: '1',
      }),
    };

    const useCase = new GetHealthCheckUseCase(systemHealthService);
    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().systemHealth).toBe('HEALTHY');
    expect(systemHealthService.getSnapshot).toHaveBeenCalledTimes(1);
  });

  it('returns unexpected error when service throws', async () => {
    const systemHealthService = {
      getSnapshot: jest.fn(() => {
        throw new Error('health failed');
      }),
    };

    const useCase = new GetHealthCheckUseCase(systemHealthService);
    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
