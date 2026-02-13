export type SystemLogLevel = 'info' | 'warn' | 'error';

export interface SystemLogInput {
  level: SystemLogLevel;
  action: string;
  message?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface ISystemLogService {
  log(input: SystemLogInput): Promise<void>;
}
