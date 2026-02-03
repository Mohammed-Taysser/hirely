declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: unknown);
    send(command: unknown): Promise<unknown>;
  }

  export class PutObjectCommand {
    constructor(input: unknown);
  }

  export class GetObjectCommand {
    constructor(input: unknown);
  }
}

declare module '@aws-sdk/s3-request-presigner' {
  export function getSignedUrl(
    client: unknown,
    command: unknown,
    options: { expiresIn: number }
  ): Promise<string>;
}
