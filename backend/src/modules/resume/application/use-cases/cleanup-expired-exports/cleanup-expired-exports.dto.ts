export interface CleanupExpiredExportsRequestDto {
  now?: Date;
  batchSize: number;
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
  failed: number;
  failures: CleanupExpiredExportsFailure[];
}
