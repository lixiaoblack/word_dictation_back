import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OssService } from '../services/oss.service';
import { ResponseDto } from '../dto/response.dto';
import type { Request } from 'express';

class UploadResponseDto {
  url: string;
}

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly ossService: OssService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: '上传图片文件',
    description: '上传图片文件到阿里云OSS并返回访问地址',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传的图片文件',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '图片文件',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '图片上传成功',
    type: ResponseDto<UploadResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<ResponseDto<UploadResponseDto> | ResponseDto<null>> {
    try {
      // 记录请求头信息用于调试
      this.logger.debug('请求头信息:', JSON.stringify(req.headers));

      if (!file) {
        this.logger.warn('未找到上传的文件');
        return new ResponseDto(400, null, '请上传图片文件');
      }

      this.logger.debug('接收到文件:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      // 验证文件类型
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        this.logger.warn(`不支持的文件类型: ${file.mimetype}`);
        // return new ResponseDto(
        //   400,
        //   null,
        //   '只支持 JPEG, PNG, JPG, WebP, GIF 格式的图片',
        // );
      }

      // 验证文件大小（最大10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.logger.warn(`文件大小超出限制: ${file.size} bytes`);
        return new ResponseDto(400, null, '图片文件大小不能超过10MB');
      }

      // 上传到OSS
      this.logger.log('开始上传文件到OSS');
      const url = await this.ossService.uploadFile(file);

      this.logger.log('文件上传成功', { url });
      return new ResponseDto(200, { url }, '图片上传成功');
    } catch (error) {
      this.logger.error('图片上传失败:', error);
      return new ResponseDto(500, null, '图片上传失败');
    }
  }
}
