export interface ExportEmailJob {
  exportId: string;
  userId: string;
  to: string;
  recipient?: {
    name?: string;
    company?: string;
    message?: string;
  };
  reason: 'free-tier-export';
}

export interface IExportEmailQueueService {
  enqueue(job: ExportEmailJob): Promise<void>;
}
