import { HttpException, HttpStatus } from '@nestjs/common';

export const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.match(/^image\/(png|jpeg|jpg|webp)$/)) {
    return callback(
      new HttpException(
        'Only image files (png, jpg, jpeg, webp) are allowed!',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};
