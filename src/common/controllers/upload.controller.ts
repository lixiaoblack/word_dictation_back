import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { OssService } from '../services/oss.service';
import { ResponseDto } from '../dto/response.dto';
import type { Request } from 'express';
import { IsOptional, IsString } from 'class-validator';

class UploadResponseDto {
  url: string;
}

class UploadImageDto {
  @ApiProperty({
    description:
      '文件夹路径（可选），不传参则存储到Upload文件夹，传参则存储到Files文件夹下的指定目录',
    example: 'documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly ossService: OssService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '上传图片文件',
    description:
      '上传图片文件到阿里云OSS并返回访问地址。支持文件夹分类存储：不传folder参数则存储到Upload文件夹，传folder参数则存储到Files文件夹下的指定目录',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传的图片文件和可选的文件夹参数',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '图片文件',
        },
        folder: {
          type: 'string',
          description:
            '文件夹路径（可选），不传参则存储到Upload文件夹，传参则存储到Files文件夹下的指定目录',
          example: 'documents',
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
    @Body() uploadDto: UploadImageDto,
    @Req() req: Request,
  ): Promise<ResponseDto<UploadResponseDto> | ResponseDto<null>> {
    try {
      // 记录请求头信息用于调试
      this.logger.debug('请求头信息:', JSON.stringify(req.headers));
      this.logger.debug('文件夹参数:', uploadDto.folder);

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

      // 根据参数决定存储路径
      let targetFolder: string;
      if (uploadDto.folder) {
        // 如果传了folder参数，存储到Files文件夹下的指定目录
        targetFolder = `Files/${uploadDto.folder}`;
        this.logger.log(`使用自定义文件夹: ${targetFolder}`);
      } else {
        // 如果没有传folder参数，存储到Upload文件夹
        targetFolder = 'Upload';
        this.logger.log('使用默认Upload文件夹');
      }

      // 上传到OSS
      this.logger.log('开始上传文件到OSS');
      const url = await this.ossService.uploadFile(
        file,
        undefined,
        targetFolder,
      );

      this.logger.log('文件上传成功', { url, folder: targetFolder });
      return new ResponseDto(200, { url }, '图片上传成功');
    } catch (error) {
      this.logger.error('图片上传失败:', error);
      return new ResponseDto(500, null, '图片上传失败');
    }
  }
}
