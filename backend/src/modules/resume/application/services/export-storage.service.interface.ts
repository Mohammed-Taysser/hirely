export interface ExportStorageUploadOptions {
  contentType: string;
  contentDisposition?: string;
}

export interface ExportStorageUploadResult {
  key: string;
  url: string;
}

export interface IExportStorageService {
  uploadBuffer(
    buffer: Buffer,
    key: string,
    options: ExportStorageUploadOptions
  ): Promise<ExportStorageUploadResult>;
  getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
}
