import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageAdapter, UploadOptions, UploadResult } from "./storage.adapter";

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION || "us-east-1";
const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;

if (!bucket || !accessKeyId || !secretAccessKey) {
  throw new Error("S3_BUCKET, S3_ACCESS_KEY, and S3_SECRET_KEY are required");
}

const client = new S3Client({
  region,
  endpoint,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export class S3StorageAdapter implements StorageAdapter {
  async uploadBuffer(buffer: Buffer, key: string, options: UploadOptions): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType,
      ContentDisposition: options.contentDisposition,
    });

    await client.send(command);

    const url = endpoint
      ? `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { key, url };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }
}
