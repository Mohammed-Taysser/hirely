export interface SystemHealthSnapshot {
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  cpu: {
    totalIdle: number;
    totalTick: number;
    cpuUsages: number;
  };
  memory: {
    totalMem: number;
    freeMem: number;
    memoryUsages: number;
  };
  uptime: number;
  platform: string;
  arch: string;
  hostname: string;
  release: string;
  totalCpus: number;
  systemType: string;
  systemVersion: string;
}

export interface ISystemHealthService {
  getSnapshot(): SystemHealthSnapshot;
}
