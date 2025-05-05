import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { ImageService } from '../image.service';
import { S3Service } from '../../../infrastructure/aws/s3/s3.service';
import { NotFoundException } from '@nestjs/common';

describe('ImageService', () => {
  let service: ImageService;
  let s3Service: S3Service;
  let cacheManager: any;

  beforeEach(async () => {
    // Create mock cache manager
    const cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    // Create mock S3 service
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

      // Expected compressed buffer (mock)
      const expectedCompressedBuffer = Buffer.from('compressed image data');

      // Mock the sharp compression (we're testing the method call, not sharp itself)
      jest.spyOn<any, any>(service, 'compressImage').mockResolvedValue(expectedCompressedBuffer);

      await service.uploadImage(mockFile);

      // Verify S3 upload was called with correct params
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('test-image.jpg'),
        expectedCompressedBuffer,
        'image/jpeg',
      );

      // Verify cache was set
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('image_'),
        {
          buffer: expectedCompressedBuffer,
          contentType: 'image/jpeg',
        },
        { ttl: 60 },
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

      // Setup cache hit
      cacheManager.get.mockResolvedValue(cachedImage);

      const result = await service.getImage(filename);

      // Verify cache was checked
      expect(cacheManager.get).toHaveBeenCalledWith(`image_${filename}`);
      
      // Verify S3 was not called
      expect(s3Service.getFile).not.toHaveBeenCalled();
      
      // Verify correct data returned
      expect(result).toEqual(cachedImage);
    });

    it('should get image from S3 and cache it if not in cache', async () => {
      const filename = 'test-image.jpg';
      const s3Image = {
        buffer: Buffer.from('s3 image data'),
        contentType: 'image/jpeg',
      };

      // Setup cache miss
      cacheManager.get.mockResolvedValue(null);
      
      // Setup S3 response
      s3Service.getFile.mockResolvedValue(s3Image);

      const result = await service.getImage(filename);

      // Verify cache was checked
      expect(cacheManager.get).toHaveBeenCalledWith(`image_${filename}`);
      
      // Verify S3 was called
      expect(s3Service.getFile).toHaveBeenCalledWith(filename);
      
      // Verify cache was set with S3 result
      expect(cacheManager.set).toHaveBeenCalledWith(
        `image_${filename}`,
        s3Image,
        { ttl: 60 },
      );
      
      // Verify correct data returned
      expect(result).toEqual(s3Image);
    });

    it('should throw NotFoundException if image not found in cache or S3', async () => {
      const filename = 'nonexistent-image.jpg';

      // Setup cache miss
      cacheManager.get.mockResolvedValue(null);
      
      // Setup S3 error
      s3Service.getFile.mockRejectedValue(new Error('Not found'));

      await expect(service.getImage(filename)).rejects.toThrow(NotFoundException);
    });
  });
});
