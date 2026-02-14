import crypto from 'crypto';

import CONFIG from '@/apps/config';
import {
  ExportStorageUploadOptions,
  ExportStorageUploadResult,
  IExportStorageService,
} from '@/modules/resume/application/services/export-storage.service.interface';

type S3RuntimeConfig = Pick<
  typeof CONFIG,
  | 'S3_ACCESS_KEY_ID'
  | 'S3_SECRET_ACCESS_KEY'
  | 'S3_BUCKET'
  | 'S3_REGION'
  | 'S3_ENDPOINT'
  | 'S3_FORCE_PATH_STYLE'
>;

type S3ResolvedConfig = {
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET: string;
  S3_REGION: string;
  S3_ENDPOINT?: string;
  S3_FORCE_PATH_STYLE: boolean;
};

const awsPercentEncode = (value: string): string =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

const formatAmzDate = (date: Date): string => date.toISOString().replace(/[:-]|\.\d{3}/g, '');
const formatDateStamp = (date: Date): string => date.toISOString().slice(0, 10).replace(/-/g, '');

const sha256Hex = (value: string | Buffer): string =>
  crypto.createHash('sha256').update(value).digest('hex');

const hmac = (key: Buffer | string, value: string): Buffer =>
  crypto.createHmac('sha256', key).update(value).digest();

const getSignatureKey = (
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string
) => {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
};

const normalizeKey = (key: string): string =>
  key
    .replace(/^[/\\]+/, '')
    .split('/')
    .map((part) => part.replace(/\.\./g, ''))
    .join('/');

const encodePath = (path: string): string =>
  path
    .split('/')
    .filter(Boolean)
    .map((segment) => awsPercentEncode(segment))
    .join('/');

type ResolvedObjectUrl = {
  url: URL;
  canonicalUri: string;
  host: string;
  publicUrl: string;
};

const resolveObjectUrl = (config: S3ResolvedConfig, key: string): ResolvedObjectUrl => {
  const bucket = config.S3_BUCKET;
  const region = config.S3_REGION;
  const endpoint = config.S3_ENDPOINT ? new URL(config.S3_ENDPOINT) : null;
  const forcePathStyle = config.S3_FORCE_PATH_STYLE || Boolean(endpoint);
  const encodedKeyPath = encodePath(normalizeKey(key));

  if (forcePathStyle) {
    const base = endpoint ?? new URL(`https://s3.${region}.amazonaws.com`);
    const basePath = base.pathname.replace(/\/$/, '');
    const canonicalUri = `${basePath}/${awsPercentEncode(bucket)}/${encodedKeyPath}`.replace(
      /\/+/g,
      '/'
    );
    const url = new URL(base.toString());
    url.pathname = canonicalUri;
    return {
      url,
      canonicalUri,
      host: url.host,
      publicUrl: url.toString(),
    };
  }

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalUri = `/${encodedKeyPath}`;
  const url = new URL(`https://${host}${canonicalUri}`);

  return {
    url,
    canonicalUri,
    host: url.host,
    publicUrl: url.toString(),
  };
};

const buildCanonicalQuery = (query: Record<string, string>): string =>
  Object.keys(query)
    .sort()
    .map((key) => `${awsPercentEncode(key)}=${awsPercentEncode(query[key])}`)
    .join('&');

export class S3ExportStorageService implements IExportStorageService {
  private readonly config: S3ResolvedConfig;

  constructor(config: S3RuntimeConfig = CONFIG) {
    if (
      !config.S3_ACCESS_KEY_ID ||
      !config.S3_SECRET_ACCESS_KEY ||
      !config.S3_BUCKET ||
      !config.S3_REGION
    ) {
      throw new Error(
        'Missing S3 configuration: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, and S3_REGION are required.'
      );
    }

    this.config = {
      S3_ACCESS_KEY_ID: config.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: config.S3_SECRET_ACCESS_KEY,
      S3_BUCKET: config.S3_BUCKET,
      S3_REGION: config.S3_REGION,
      S3_ENDPOINT: config.S3_ENDPOINT,
      S3_FORCE_PATH_STYLE: config.S3_FORCE_PATH_STYLE,
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    options: ExportStorageUploadOptions
  ): Promise<ExportStorageUploadResult> {
    const normalizedKey = normalizeKey(key);
    const now = new Date();
    const amzDate = formatAmzDate(now);
    const dateStamp = formatDateStamp(now);
    const payloadHash = sha256Hex(buffer);

    const { url, canonicalUri, host, publicUrl } = resolveObjectUrl(this.config, normalizedKey);
    const credentialScope = `${dateStamp}/${this.config.S3_REGION}/s3/aws4_request`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const canonicalRequest = [
      'PUT',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join('\n');

    const signingKey = getSignatureKey(
      this.config.S3_SECRET_ACCESS_KEY,
      dateStamp,
      this.config.S3_REGION,
      's3'
    );
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorization = `AWS4-HMAC-SHA256 Credential=${this.config.S3_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: authorization,
        Host: host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
        'content-type': options.contentType,
        ...(options.contentDisposition
          ? {
              'content-disposition': options.contentDisposition,
            }
          : {}),
      },
      body: Uint8Array.from(buffer),
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed with status ${response.status}`);
    }

    return {
      key: normalizedKey,
      url: publicUrl,
    };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    const normalizedKey = normalizeKey(key);
    const now = new Date();
    const amzDate = formatAmzDate(now);
    const dateStamp = formatDateStamp(now);

    const { url, canonicalUri, host } = resolveObjectUrl(this.config, normalizedKey);
    const credentialScope = `${dateStamp}/${this.config.S3_REGION}/s3/aws4_request`;
    const queryParams: Record<string, string> = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${this.config.S3_ACCESS_KEY_ID}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresInSeconds),
      'X-Amz-SignedHeaders': 'host',
    };
    const canonicalQuery = buildCanonicalQuery(queryParams);
    const canonicalRequest = [
      'GET',
      canonicalUri,
      canonicalQuery,
      `host:${host}\n`,
      'host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join('\n');

    const signingKey = getSignatureKey(
      this.config.S3_SECRET_ACCESS_KEY,
      dateStamp,
      this.config.S3_REGION,
      's3'
    );
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    queryParams['X-Amz-Signature'] = signature;

    const signedUrl = new URL(url.toString());
    signedUrl.search = buildCanonicalQuery(queryParams);

    return signedUrl.toString();
  }

  async deleteObject(key: string): Promise<void> {
    const normalizedKey = normalizeKey(key);
    const now = new Date();
    const amzDate = formatAmzDate(now);
    const dateStamp = formatDateStamp(now);
    const payloadHash = sha256Hex('');

    const { url, canonicalUri, host } = resolveObjectUrl(this.config, normalizedKey);
    const credentialScope = `${dateStamp}/${this.config.S3_REGION}/s3/aws4_request`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const canonicalRequest = [
      'DELETE',
      canonicalUri,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join('\n');

    const signingKey = getSignatureKey(
      this.config.S3_SECRET_ACCESS_KEY,
      dateStamp,
      this.config.S3_REGION,
      's3'
    );
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');
    const authorization = `AWS4-HMAC-SHA256 Credential=${this.config.S3_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authorization,
        Host: host,
        'x-amz-content-sha256': payloadHash,
        'x-amz-date': amzDate,
      },
    });

    if (response.status === 404 || response.status === 204) {
      return;
    }

    if (!response.ok) {
      throw new Error(`S3 delete failed with status ${response.status}`);
    }
  }
}
