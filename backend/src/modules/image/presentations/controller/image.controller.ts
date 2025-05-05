import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
  Res,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImageService } from '../../application/services/image.service';
import { ApiTags, ApiConsumes, ApiBody, ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { imageFileFilter } from '../../utils/image-file-filter';
import { MAX_FILE_SIZE } from '../../constants';

@ApiTags('Images')
@Controller()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload/image')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Image uploaded successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid file type' })
  @ApiResponse({ status: HttpStatus.PAYLOAD_TOO_LARGE, description: 'File too large' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: imageFileFilter,
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
    }

    await this.imageService.uploadImage(file);
    return;
  }

  @Get('static/image/:filename')
  @ApiOperation({ summary: 'Get an image by filename' })
  @ApiParam({ name: 'filename', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Image retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Image not found' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const { buffer, contentType } = await this.imageService.getImage(filename);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.send(buffer);
  }
}
