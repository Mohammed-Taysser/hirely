export interface IResumeDefaultRepository {
  setDefaultResume(userId: string, resumeId: string): Promise<void>;
  findOldestResumeIdByUserId(userId: string, excludeResumeId?: string): Promise<string | null>;
}
