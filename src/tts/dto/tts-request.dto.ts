/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: TTS请求数据传输对象
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { VOICE_PRESETS } from '../interfaces/voice.interface';

export class TtsRequestDto {
  @ApiProperty({
    description: '要转换的文本',
    example: 'Hello world, this is a test.',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000, { message: '文本长度不能超过1000字符' })
  text: string;

  @ApiPropertyOptional({
    description: '语音类型',
    example: 'en-US-AriaNeural',
    default: 'en-US-AriaNeural',
    enum: Object.values(VOICE_PRESETS),
  })
  @IsOptional()
  @IsString()
  voice?: string = VOICE_PRESETS.EN_US_FEMALE;

  @ApiPropertyOptional({
    description: '语速 (0.5-2.0，1.0为正常语速)',
    example: 1.0,
    minimum: 0.5,
    maximum: 2.0,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5, { message: '语速不能小于0.5' })
  @Max(2.0, { message: '语速不能大于2.0' })
  rate?: number = 1.0;

  @ApiPropertyOptional({
    description: '音调调节 (-50到50，0为正常音调)',
    example: 0,
    minimum: -50,
    maximum: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(-50, { message: '音调不能小于-50' })
  @Max(50, { message: '音调不能大于50' })
  pitch?: number = 0;

  @ApiPropertyOptional({
    description: '音量 (0-100，100为最大音量)',
    example: 100,
    minimum: 0,
    maximum: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '音量不能小于0' })
  @Max(100, { message: '音量不能大于100' })
  volume?: number = 100;
}

export class WordTtsRequestDto {
  @ApiProperty({
    description: '单词',
    example: 'hello',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100, { message: '单词长度不能超过100字符' })
  word: string;

  @ApiPropertyOptional({
    description: '语音类型（英文发音）',
    example: 'en-US-AriaNeural',
    default: 'en-US-AriaNeural',
  })
  @IsOptional()
  @IsString()
  voice?: string = VOICE_PRESETS.EN_US_FEMALE;

  @ApiPropertyOptional({
    description: '语速',
    example: 1.0,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  rate?: number = 1.0;
}

export class BatchTtsRequestDto {
  @ApiProperty({
    description: '文本列表',
    example: ['hello', 'world', 'test'],
    type: [String],
    maxItems: 50,
  })
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: '每个文本长度不能超过100字符' })
  texts: string[];

  @ApiPropertyOptional({
    description: '语音类型',
    example: 'en-US-AriaNeural',
    default: 'en-US-AriaNeural',
  })
  @IsOptional()
  @IsString()
  voice?: string = VOICE_PRESETS.EN_US_FEMALE;

  @ApiPropertyOptional({
    description: '语速',
    example: 1.0,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  rate?: number = 1.0;

  @ApiPropertyOptional({
    description: '文本间间隔时间（毫秒）',
    example: 1000,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  interval?: number = 1000;
}

export class GetAudioUrlRequestDto {
  @ApiProperty({
    description: '要获取音频的单词或中文文本',
    example: 'hello',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: '文本长度不能超过200字符' })
  text: string;

  @ApiPropertyOptional({
    description: '语音类型（英文单词使用英文语音，中文使用中文语音）',
    example: 'en-US-AriaNeural',
    default: 'auto',
  })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiPropertyOptional({
    description: '语速',
    example: 1.0,
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2.0)
  rate?: number = 1.0;

  @ApiPropertyOptional({
    description: '是否强制重新生成（如果已存在音频文件）',
    example: false,
    default: false,
  })
  @IsOptional()
  force_regenerate?: boolean = false;
}
