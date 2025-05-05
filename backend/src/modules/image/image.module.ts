import { Module } from '@nestjs/common';
import { ImageController } from './presentations/controller/image.controller';
import { ImageService } from './application/services/image.service';
import { S3Service } from '../../infrastructure/aws/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule, 
    CacheModule.register({
      ttl: 60,
      isGlobal: true,
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService, S3Service],
  exports: [ImageService],
})
export class ImageModule {}
