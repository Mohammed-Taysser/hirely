export interface ExportQueueJob {
  exportId: string;
  snapshotId: string;
  userId: string;
}

export interface IExportQueueService {
  enqueuePdf(job: ExportQueueJob): Promise<void>;
}
