import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import * as sharp from 'sharp';
import { S3Service } from 'src/infrastructure/aws/s3/s3.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly s3Service: S3Service,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<void> {
    const compressedBuffer = await this.compressImage(file.buffer, file.mimetype);
    
    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    await this.s3Service.uploadFile(filename, compressedBuffer, file.mimetype);
    
    await this.cacheManager.set(
      `image_${filename}`,
      {
        buffer: compressedBuffer,
        contentType: file.mimetype,
      },
      60
    );
  }

  async getImage(filename: string): Promise<{ buffer: Buffer; contentType: string }> {
    const cachedImage = await this.cacheManager.get<{ buffer: Buffer; contentType: string }>(`image_${filename}`);
    
    if (cachedImage) {
      return cachedImage;
    }
    
    try {
      const { buffer, contentType } = await this.s3Service.getFile(filename);
      
      await this.cacheManager.set(
        `image_${filename}`,
        { buffer, contentType },
        60
      );
      
      return { buffer, contentType };
    } catch (error) {
      throw new NotFoundException(`Image ${filename} not found`);
    }
  }

  private async compressImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    let sharpInstance = sharp(buffer);
    
    if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') {
      sharpInstance = sharpInstance.jpeg({ quality: 80 });
    } else if (mimetype === 'image/png') {
      sharpInstance = sharpInstance.png({ compressionLevel: 8 });
    } else if (mimetype === 'image/webp') {
      sharpInstance = sharpInstance.webp({ quality: 80 });
    }
    
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.width > 1920) {
      sharpInstance = sharpInstance.resize({ width: 1920, withoutEnlargement: true });
    }
    
    return sharpInstance.toBuffer();
  }
}
