import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import {
  ExportStorageUploadOptions,
  ExportStorageUploadResult,
  IExportStorageService,
} from '@/modules/resume/application/services/export-storage.service.interface';

const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

const sanitizeKey = (key: string) => {
  const trimmed = key.replace(/^[/\\]+/, '');
  return trimmed.replace(/\.\./g, '');
};

export class LocalExportStorageService implements IExportStorageService {
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    options: ExportStorageUploadOptions
  ): Promise<ExportStorageUploadResult> {
    const safeKey = sanitizeKey(key);
    const fullPath = path.join(uploadsDir, safeKey);
    const dirPath = path.dirname(fullPath);

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(fullPath, buffer);
    const localUrl = pathToFileURL(fullPath).toString();
    const ignoresMetadata = Boolean(options.contentDisposition || options.contentType);
    if (ignoresMetadata) {
      // Local file storage ignores HTTP metadata.
    }

    return {
      key: safeKey,
      url: localUrl,
    };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    const safeKey = sanitizeKey(key);
    const fullPath = path.join(uploadsDir, safeKey);
    const localUrl = pathToFileURL(fullPath).toString();
    if (expiresInSeconds > 0) {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      return `${localUrl}?expiresAt=${expiresAt}`;
    }

    return localUrl;
  }
}
