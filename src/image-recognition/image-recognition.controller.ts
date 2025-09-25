import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ImageRecognitionService } from './image-recognition.service';
import { RecognitionResult } from '../types';
import { RecognitionResultDto } from './dto';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('图片识别')
@Controller('recognition')
export class ImageRecognitionController {
  constructor(
    private readonly imageRecognitionService: ImageRecognitionService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: '上传图片进行文字识别',
    description: `
      上传图片文件，使用AI识别其中的文字并分析英文单词。
      
      **支持的图片格式：**
      - JPEG, JPG
      - PNG
      - WebP
      
      **文件限制：**
      - 最大文件大小：10MB
      
      **AI提供商选择：**
      - **doubao (推荐)**：图片文字识别准确率高
      - **deepseek**：文本理解能力强
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    description: '上传的图片文件',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '图片文件 (JPEG, PNG, JPG, WebP, 最大5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    enum: ['doubao', 'deepseek'],
    description: 'AI提供商选择，默认为doubao',
    example: 'doubao',
  })
  @ApiResponse({
    status: 200,
    description: '图片识别成功',
    type: ResponseDto<RecognitionResultDto>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async recognizeImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('provider') provider: 'doubao' | 'deepseek' = 'doubao',
  ): Promise<ResponseDto<RecognitionResultDto> | ResponseDto<null>> {
    try {
      if (!file) {
        return new ResponseDto(400, null, '请上传图片文件');
      }

      // 验证文件类型
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return new ResponseDto(
          400,
          null,
          '只支持 JPEG, PNG, JPG, WebP 格式的图片',
        );
      }

      // 验证文件大小（最大10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return new ResponseDto(400, null, '图片文件大小不能超过10MB');
      }

      const result = await this.imageRecognitionService.recognizeText(
        file,
        provider,
      );

      // 转换为DTO格式
      const recognitionResultDto = new RecognitionResultDto();
      recognitionResultDto.originalText = result.originalText;
      recognitionResultDto.words = result.words;
      recognitionResultDto.provider = result.provider;
      recognitionResultDto.confidence = result.confidence;

      return new ResponseDto(200, recognitionResultDto, '图片识别成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '图片识别失败',
      );
    }
  }

  @Post('text')
  @ApiOperation({
    summary: '处理纯文本内容',
    description: `
      直接处理输入的文本内容，分析其中的英文单词。
      
      **适用场景：**
      - 已知的文本内容分析
      - 测试AI处理能力
      - 批量处理文本数据
      
      **输入要求：**
      - 文本不能为空
      - 建议包含英文单词以获得最佳效果
    `,
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'text',
    required: true,
    type: String,
    description: '要处理的文本内容',
    example: 'Hello world, this is a beautiful day!',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    enum: ['doubao', 'deepseek'],
    description: 'AI提供商选择，默认为doubao',
    example: 'doubao',
  })
  @ApiResponse({
    status: 200,
    description: '文本处理成功',
    type: ResponseDto<RecognitionResultDto>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async recognizeText(
    @Query('text') text: string,
    @Query('provider') provider: 'doubao' | 'deepseek' = 'doubao',
  ): Promise<ResponseDto<RecognitionResultDto> | ResponseDto<null>> {
    try {
      if (!text || text.trim().length === 0) {
        return new ResponseDto(400, null, '请提供要处理的文本');
      }

      const result = await this.imageRecognitionService.processText(
        text,
        provider,
      );

      // 转换为DTO格式
      const recognitionResultDto = new RecognitionResultDto();
      recognitionResultDto.originalText = result.originalText;
      recognitionResultDto.words = result.words;
      recognitionResultDto.provider = result.provider;
      recognitionResultDto.confidence = result.confidence;

      return new ResponseDto(200, recognitionResultDto, '文本处理成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '文本处理失败',
      );
    }
  }
}
