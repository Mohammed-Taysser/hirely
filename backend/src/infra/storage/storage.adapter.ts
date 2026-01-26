export type UploadResult = {
  key: string;
  url: string;
};

export type UploadOptions = {
  contentType: string;
  contentDisposition?: string;
};

export interface StorageAdapter {
  uploadBuffer(buffer: Buffer, key: string, options: UploadOptions): Promise<UploadResult>;
  getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string>;
}
