import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class ImageService {
  private readonly s3Client: S3Client;
  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get<string>('AWS_S3_REGION'),
    });
  }

  async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(
      files.map((file) => {
        const key = `${new Date().toISOString()}-${Math.random().toString(36).substring(2)}.${path.extname(file.originalname)}`;
        return this.uploadFile(file, key);
      }),
    );
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
      Key: key,
      Body: file.buffer,
      Metadata: {
        originalName: encodeURIComponent(file.originalname),
      },
    });

    await this.s3Client.send(command).catch(() => {
      throw new InternalServerErrorException();
    });
    return key;
  }
}
