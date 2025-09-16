import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

// 请求DTO
export class TextProcessDto {
  @ApiProperty({
    description: '要处理的文本内容',
    example: 'Hello world, this is a beautiful day!',
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: '文本内容不能为空' })
  text: string;

  @ApiPropertyOptional({
    description: 'AI提供商选择',
    enum: ['doubao', 'deepseek'],
    default: 'doubao',
    example: 'doubao',
  })
  @IsOptional()
  @IsEnum(['doubao', 'deepseek'], {
    message: '提供商必须是 doubao 或 deepseek',
  })
  provider?: 'doubao' | 'deepseek';
}

export class ImageUploadDto {
  @ApiProperty({
    description: '图片文件',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiPropertyOptional({
    description: 'AI提供商选择',
    enum: ['doubao', 'deepseek'],
    default: 'doubao',
    example: 'doubao',
  })
  @IsOptional()
  @IsEnum(['doubao', 'deepseek'], {
    message: '提供商必须是 doubao 或 deepseek',
  })
  provider?: 'doubao' | 'deepseek';
}

// 响应DTO
export class WordInfoDto {
  @ApiProperty({
    description: '英文单词',
    example: 'hello',
  })
  @IsString()
  word: string;

  @ApiPropertyOptional({
    description: '音标（英式发音）',
    example: '/həˈloʊ/',
  })
  @IsOptional()
  @IsString()
  phonetic?: string;

  @ApiProperty({
    description: '中文翻译',
    example: '你好',
  })
  @IsString()
  translation: string;

  @ApiPropertyOptional({
    description: '词性',
    example: '感叹词',
  })
  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @ApiPropertyOptional({
    description: '详细释义列表',
    type: [String],
    example: ['用于问候', '表示友好的问候语'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  definitions?: string[];

  @ApiPropertyOptional({
    description: '例句列表',
    type: [String],
    example: ['Hello, how are you?', 'Hello world!'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examples?: string[];
}

export class RecognitionResultDto {
  @ApiProperty({
    description: '原始识别文本',
    example: 'Hello world, beautiful day',
  })
  @IsString()
  originalText: string;

  @ApiProperty({
    description: '识别到的单词信息列表',
    type: [WordInfoDto],
  })
  @IsArray()
  words: WordInfoDto[];

  @ApiPropertyOptional({
    description: '识别置信度（0-100）',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  confidence?: number;

  @ApiProperty({
    description: '使用的AI提供商',
    enum: ['doubao', 'deepseek'],
    example: 'doubao',
  })
  @IsEnum(['doubao', 'deepseek'])
  provider: 'doubao' | 'deepseek';
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: '服务状态',
    example: 'ok',
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: '检查时间戳',
    example: '2025-09-02T14:30:40.131Z',
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: '服务名称',
    example: 'en-study-backend',
  })
  @IsString()
  service: string;

  @ApiProperty({
    description: '服务版本',
    example: '1.0.0',
  })
  @IsString()
  version: string;
}

// 导出ResponseDto
export { ResponseDto } from '../common/dto/response.dto';
