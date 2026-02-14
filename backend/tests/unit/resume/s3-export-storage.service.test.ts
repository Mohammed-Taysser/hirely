import { S3ExportStorageService } from '@dist/modules/resume/infrastructure/services/s3-export-storage.service';

describe('S3ExportStorageService', () => {
  const config = {
    S3_ACCESS_KEY_ID: 'key',
    S3_SECRET_ACCESS_KEY: 'secret',
    S3_BUCKET: 'hirely-bucket',
    S3_REGION: 'us-east-1',
    S3_ENDPOINT: 'https://s3.us-east-1.amazonaws.com',
    S3_FORCE_PATH_STYLE: true,
  };

  it('uploads buffer using signed request', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
    } as never);

    const service = new S3ExportStorageService(config as never);
    const result = await service.uploadBuffer(Buffer.from('pdf'), 'user/exports/file.pdf', {
      contentType: 'application/pdf',
      contentDisposition: 'attachment; filename="resume.pdf"',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'PUT',
      })
    );
    expect(result.key).toBe('user/exports/file.pdf');
    expect(result.url).toContain('hirely-bucket');

    fetchSpy.mockRestore();
  });

  it('throws when upload fails', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
    } as never);

    const service = new S3ExportStorageService(config as never);

    await expect(
      service.uploadBuffer(Buffer.from('pdf'), 'user/exports/file.pdf', {
        contentType: 'application/pdf',
      })
    ).rejects.toThrow('S3 upload failed with status 403');

    fetchSpy.mockRestore();
  });

  it('builds pre-signed download url', async () => {
    const service = new S3ExportStorageService(config as never);
    const url = await service.getSignedDownloadUrl('user/exports/file.pdf', 600);

    expect(url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toContain('X-Amz-Signature=');
    expect(url).toContain('X-Amz-Expires=600');
  });

  it('deletes object using signed request', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
    } as never);

    const service = new S3ExportStorageService(config as never);
    await service.deleteObject('user/exports/file.pdf');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
    fetchSpy.mockRestore();
  });

  it('throws when required configuration is missing', () => {
    expect(
      () =>
        new S3ExportStorageService({
          ...config,
          S3_BUCKET: undefined,
        } as never)
    ).toThrow('Missing S3 configuration');
  });
});
