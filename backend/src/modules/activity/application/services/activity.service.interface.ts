export interface IActivityService {
  log(userId: string, type: string, metadata?: Record<string, unknown>): Promise<void>;
}
