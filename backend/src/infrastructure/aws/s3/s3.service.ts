import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    // Using LocalStack S3 endpoint
    const endpoint = process.env.S3_ENDPOINT || 'http://localhost:4566';
    this.bucketName = process.env.S3_BUCKET_NAME || 'images-bucket';

    this.s3Client = new S3Client({
      region: 'us-east-1', // Default region
      endpoint,
      forcePathStyle: true, // Required for LocalStack
      credentials: {
        accessKeyId: 'test', // Dummy credentials for LocalStack
        secretAccessKey: 'test',
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // Check if bucket exists
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName })
      );
      this.logger.log(`Bucket '${this.bucketName}' already exists`);
    } catch (error) {
      // Bucket doesn't exist, create it
      try {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucketName })
        );
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      } catch (createError) {
        this.logger.error(`Failed to create bucket: ${createError.message}`);
        throw createError;
      }
    }
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );
      this.logger.log(`File uploaded to S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw error;
    }
  }

  async getFile(key: string): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      // Convert stream to buffer
      const responseBuffer = await this.streamToBuffer(response.Body as Readable);
      
      return {
        buffer: responseBuffer,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch (error) {
      this.logger.error(`Failed to get file from S3: ${error.message}`);
      throw error;
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
