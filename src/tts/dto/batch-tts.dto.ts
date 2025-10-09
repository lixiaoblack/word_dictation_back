/*
 * @Author: wanglx
 * @Date: 2025-10-09 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-10-09 20:00:00
 * @Description: TTS批量转换DTO
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AudioType } from '../entities/tts-audio.entity';

export class BatchTtsRequestDto {
  @ApiProperty({
    description: '文本列表',
    example: ['hello', 'world', 'TTS test'],
    isArray: true,
    type: String,
  })
  @IsArray()
  @ArrayMaxSize(50, { message: '单次最多支持50个文本' })
  @IsString({ each: true, message: '每个文本必须是字符串' })
  texts: string[];

  @ApiProperty({
    description: '语音类型',
    example: 'en-US-AriaNeural',
    default: 'en-US-AriaNeural',
    required: false,
  })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiProperty({
    description: '语速（0.5-2.0）',
    example: 1.0,
    default: 1.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5, { message: '语速不能小于0.5' })
  @Max(2.0, { message: '语速不能大于2.0' })
  rate?: number;

  @ApiProperty({
    description: '音调（-50到50）',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(-50, { message: '音调不能小于-50' })
  @Max(50, { message: '音调不能大于50' })
  pitch?: number;

  @ApiProperty({
    description: '音量（0-100）',
    example: 100,
    default: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: '音量不能小于0' })
  @Max(100, { message: '音量不能大于100' })
  volume?: number;

  @ApiProperty({
    description: '音频类型',
    enum: AudioType,
    example: AudioType.WORD,
    default: AudioType.TEXT,
    required: false,
  })
  @IsOptional()
  @IsEnum(AudioType)
  type?: AudioType;

  @ApiProperty({
    description: '是否强制重新生成（忽略缓存）',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  force_regenerate?: boolean;
}

export class TtsAudioInfoDto {
  @ApiProperty({ description: '音频记录ID' })
  id: number;

  @ApiProperty({ description: '原始文本' })
  text: string;

  @ApiProperty({ description: '语音类型' })
  voice: string;

  @ApiProperty({ description: '音频类型' })
  type: AudioType;

  @ApiProperty({ description: '文件URL' })
  file_url: string;

  @ApiProperty({ description: '文件大小（字节）' })
  file_size: number;

  @ApiProperty({ description: '音频时长（秒）' })
  duration: number | null;

  @ApiProperty({ description: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '是否是新生成的' })
  is_new: boolean;
}

export class BatchTtsResponseDto {
  @ApiProperty({ description: '成功生成的音频数量' })
  success_count: number;

  @ApiProperty({ description: '失败的文本数量' })
  failure_count: number;

  @ApiProperty({ description: '跳过的文本数量（已存在）' })
  skipped_count: number;

  @ApiProperty({ description: '总处理时间（毫秒）' })
  total_time: number;

  @ApiProperty({ description: '音频信息列表', type: [TtsAudioInfoDto] })
  audio_list: TtsAudioInfoDto[];

  @ApiProperty({ description: '失败的文本列表' })
  failed_texts: string[];

  @ApiProperty({ description: '存储文件夹路径' })
  storage_folder: string;
}

export class TtsQueryDto {
  @ApiProperty({
    description: '搜索关键词',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description: '语音类型过滤',
    required: false,
  })
  @IsOptional()
  @IsString()
  voice?: string;

  @ApiProperty({
    description: '音频类型过滤',
    enum: AudioType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AudioType)
  type?: AudioType;

  @ApiProperty({
    description: '页码',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  page_size?: number = 20;
}

export class TtsRecordDetailDto {
  @ApiProperty({ description: '音频记录ID' })
  id: number;

  @ApiProperty({ description: '内容哈希' })
  content_hash: string;

  @ApiProperty({ description: '原始文本' })
  text: string;

  @ApiProperty({ description: '语音类型' })
  voice: string;

  @ApiProperty({ description: '音频类型' })
  type: AudioType;

  @ApiProperty({ description: '语速' })
  rate: number;

  @ApiProperty({ description: '音调' })
  pitch: number;

  @ApiProperty({ description: '音量' })
  volume: number;

  @ApiProperty({ description: '文件URL' })
  file_url: string;

  @ApiProperty({ description: '文件路径' })
  file_path: string;

  @ApiProperty({ description: '文件名' })
  file_name: string;

  @ApiProperty({ description: '文件大小（字节）' })
  file_size: number;

  @ApiProperty({ description: '音频时长（秒）' })
  duration: number | null;

  @ApiProperty({ description: '音频格式' })
  format: string;

  @ApiProperty({ description: '使用次数' })
  usage_count: number;

  @ApiProperty({ description: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '最后使用时间' })
  last_used_at: Date | null;
}
