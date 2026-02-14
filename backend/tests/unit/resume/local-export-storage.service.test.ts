import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('LocalExportStorageService', () => {
  it('uploads file to local storage and returns file url', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hirely-storage-'));
    process.env.UPLOADS_DIR = tempDir;

    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { LocalExportStorageService } = require('@dist/modules/resume/infrastructure/services/local-export-storage.service');

    const service = new LocalExportStorageService();
    const result = await service.uploadBuffer(Buffer.from('pdf'), 'user/exports/file.pdf', {
      contentType: 'application/pdf',
    });

    expect(result.key).toBe('user/exports/file.pdf');
    expect(result.url.startsWith('file://')).toBe(true);

    const filePath = fileURLToPath(result.url);
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toBe('pdf');
  });

  it('returns signed local file url with expiration', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hirely-storage-'));
    process.env.UPLOADS_DIR = tempDir;

    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { LocalExportStorageService } = require('@dist/modules/resume/infrastructure/services/local-export-storage.service');

    const service = new LocalExportStorageService();
    const url = await service.getSignedDownloadUrl('user/exports/file.pdf', 60);

    expect(url.startsWith('file://')).toBe(true);
    expect(url).toContain('expiresAt=');
  });

  it('deletes local object and ignores missing files', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hirely-storage-'));
    process.env.UPLOADS_DIR = tempDir;

    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { LocalExportStorageService } = require('@dist/modules/resume/infrastructure/services/local-export-storage.service');

    const service = new LocalExportStorageService();
    await service.uploadBuffer(Buffer.from('pdf'), 'user/exports/file-to-delete.pdf', {
      contentType: 'application/pdf',
    });

    await expect(service.deleteObject('user/exports/file-to-delete.pdf')).resolves.toBeUndefined();
    await expect(service.deleteObject('user/exports/file-to-delete.pdf')).resolves.toBeUndefined();
  });
});
