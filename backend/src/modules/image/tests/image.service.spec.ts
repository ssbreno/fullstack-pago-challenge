import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../../../infrastructure/aws/s3/s3.service';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ImageService } from '../application/services/image.service';
import { describe, beforeEach, it, expect, jest } from '@jest/globals';

describe('ImageService', () => {
  let service: ImageService;
  let s3Service: S3Service;
  let cacheManager: any;

  beforeEach(async () => {
    const cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const s3ServiceMock = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: S3Service,
          useValue: s3ServiceMock,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheMock,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    s3Service = module.get<S3Service>(S3Service);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should compress and upload an image to S3 and cache it', async () => {
      // Mock file
      const mockFile = {
        buffer: Buffer.from('test image data'),
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const expectedCompressedBuffer = Buffer.from('compressed image data');

      jest.spyOn(service as any, 'compressImage').mockResolvedValue(expectedCompressedBuffer);

      await service.uploadImage(mockFile);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('test-image.jpg'),
        expectedCompressedBuffer,
        'image/jpeg',
      );

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('image_'),
        {
          buffer: expectedCompressedBuffer,
          contentType: 'image/jpeg',
        },
        60
      );
    });
  });

  describe('getImage', () => {
    it('should return image from cache if available', async () => {
      const filename = 'test-image.jpg';
      const cachedImage = {
        buffer: Buffer.from('cached image data'),
        contentType: 'image/jpeg',
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedImage);

      const result = await service.getImage(filename);
      expect(cacheManager.get).toHaveBeenCalledWith(`image_${filename}`);
      
      expect(s3Service.getFile).not.toHaveBeenCalled();
      
      expect(result).toEqual(cachedImage);
    });

    it('should get image from S3 and cache it if not in cache', async () => {
      const filename = 'test-image.jpg';
      const s3Image = {
        buffer: Buffer.from('s3 image data'),
        contentType: 'image/jpeg',
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      
      jest.spyOn(s3Service, 'getFile').mockResolvedValue(s3Image);

      const result = await service.getImage(filename);

      expect(cacheManager.get).toHaveBeenCalledWith(`image_${filename}`);
      
      expect(s3Service.getFile).toHaveBeenCalledWith(filename);
      
      expect(cacheManager.set).toHaveBeenCalledWith(
        `image_${filename}`,
        s3Image,
        60
      );
      
      expect(result).toEqual(s3Image);
    });

    it('should throw NotFoundException if image not found in cache or S3', async () => {
      const filename = 'nonexistent-image.jpg';

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      jest.spyOn(s3Service, 'getFile').mockRejectedValue(new Error('Not found'));

      await expect(service.getImage(filename)).rejects.toThrow(NotFoundException);
    });
  });
});
