type LoadedSystemHealth = {
  OsSystemHealthService: new () => { getSnapshot: () => { systemHealth: string } };
};

const loadService = async (
  params?: { cpuUsages?: number; memoryUsages?: number }
): Promise<LoadedSystemHealth> => {
  jest.resetModules();

  const cpuUsages = params?.cpuUsages ?? 50;
  const memoryUsages = params?.memoryUsages ?? 40;

  // totalTick=100, totalIdle=(100-cpuUsage)
  const totalTick = 100;
  const totalIdle = totalTick - cpuUsages;
  // totalMem=1000, freeMem=(1000-memoryUsage*10)
  const totalMem = 1000;
  const freeMem = totalMem - memoryUsages * 10;

  jest.doMock('node:os', () => ({
    __esModule: true,
    default: {
      cpus: () => [
        {
          times: {
            idle: totalIdle,
            user: totalTick - totalIdle,
            nice: 0,
            sys: 0,
            irq: 0,
          },
        },
      ],
      totalmem: () => totalMem,
      freemem: () => freeMem,
      uptime: () => 123,
      platform: () => 'linux',
      arch: () => 'x64',
      hostname: () => 'hirely-dev',
      release: () => '1',
      type: () => 'Linux',
      version: () => '6.0',
    },
  }));

  return import('@dist/modules/system/infrastructure/services/os-system-health.service');
};

describe('OsSystemHealthService', () => {
  it('returns HEALTHY when usage is below thresholds', async () => {
    const { OsSystemHealthService } = await loadService({ cpuUsages: 60, memoryUsages: 60 });
    const snapshot = new OsSystemHealthService().getSnapshot();

    expect(snapshot.systemHealth).toBe('HEALTHY');
  });

  it('returns DEGRADED when cpu or memory usage is above 90', async () => {
    const { OsSystemHealthService } = await loadService({ cpuUsages: 91, memoryUsages: 70 });
    const snapshot = new OsSystemHealthService().getSnapshot();

    expect(snapshot.systemHealth).toBe('DEGRADED');
  });

  it('returns DOWN when cpu or memory usage is above 95', async () => {
    const { OsSystemHealthService } = await loadService({ cpuUsages: 96, memoryUsages: 70 });
    const snapshot = new OsSystemHealthService().getSnapshot();

    expect(snapshot.systemHealth).toBe('DOWN');
  });
});
