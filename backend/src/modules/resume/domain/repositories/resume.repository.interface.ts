import { Resume } from '../resume.aggregate';

export interface IResumeRepository {
  save(resume: Resume): Promise<void>;
  findById(id: string, userId: string): Promise<Resume | null>;
  delete(id: string, userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
