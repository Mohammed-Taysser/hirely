import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { StorageAdapter, UploadOptions, UploadResult } from './storage.adapter';

const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

const sanitizeKey = (key: string) => {
  const trimmed = key.replace(/^[/\\]+/, '');
  return trimmed.replace(/\.\./g, '');
};

export class LocalStorageAdapter implements StorageAdapter {
  async uploadBuffer(buffer: Buffer, key: string, _options: UploadOptions): Promise<UploadResult> {
    const safeKey = sanitizeKey(key);
    const fullPath = path.join(uploadsDir, safeKey);
    const dirPath = path.dirname(fullPath);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return {
      key: safeKey,
      url: pathToFileURL(fullPath).toString(),
    };
  }

  async getSignedDownloadUrl(key: string, _expiresInSeconds: number): Promise<string> {
    const safeKey = sanitizeKey(key);
    const fullPath = path.join(uploadsDir, safeKey);
    return pathToFileURL(fullPath).toString();
  }
}
