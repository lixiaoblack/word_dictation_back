import { Module } from '@nestjs/common';
import { OssService } from './services/oss.service';
import { UploadController } from './controllers/upload.controller';

@Module({
  controllers: [UploadController],
  providers: [OssService],
  exports: [OssService],
})
export class UploadModule {}
