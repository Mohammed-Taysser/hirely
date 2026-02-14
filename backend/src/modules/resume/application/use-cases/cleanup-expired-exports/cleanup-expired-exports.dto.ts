export interface CleanupExpiredExportsRequestDto {
  now?: Date;
  batchSize: number;
  dryRun?: boolean;
}

export interface CleanupExpiredExportsFailure {
  exportId: string;
  userId: string;
  reason: string;
}

export interface CleanupExpiredExportsResponseDto {
  scanned: number;
  deletedRecords: number;
  deletedFiles: number;
  wouldDeleteRecords: number;
  wouldDeleteFiles: number;
  dryRun: boolean;
  failed: number;
  failures: CleanupExpiredExportsFailure[];
}
