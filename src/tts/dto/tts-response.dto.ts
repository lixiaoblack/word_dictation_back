/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: TTS响应数据传输对象
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoiceConfig } from '../interfaces/voice.interface';

export class TtsResponseDto {
  @ApiProperty({
    description: '音频数据（Base64编码）',
    example:
      'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAA...',
  })
  audioData: string;

  @ApiProperty({
    description: '音频格式',
    example: 'audio/mpeg',
  })
  format: string;

  @ApiProperty({
    description: '音频大小（字节）',
    example: 12345,
  })
  size: number;

  @ApiPropertyOptional({
    description: '音频时长（秒）',
    example: 2.5,
  })
  duration?: number;

  @ApiProperty({
    description: '使用的语音',
    example: 'en-US-AriaNeural',
  })
  voice: string;

  @ApiProperty({
    description: '语速',
    example: 1.0,
  })
  rate: number;

  @ApiProperty({
    description: '音调',
    example: 0,
  })
  pitch: number;
}

export class VoiceListResponseDto {
  @ApiProperty({
    description: '语音列表',
    type: [Object],
  })
  voices: VoiceConfig[];

  @ApiProperty({
    description: '语音总数',
    example: 100,
  })
  total: number;
}

export class BatchTtsResponseDto {
  @ApiProperty({
    description: '音频文件列表',
    type: [Object],
  })
  audioFiles: {
    text: string;
    audioData: string;
    format: string;
    size: number;
  }[];

  @ApiProperty({
    description: '总音频数量',
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: '总音频大小（字节）',
    example: 123456,
  })
  totalSize: number;

  @ApiProperty({
    description: '使用的语音',
    example: 'en-US-AriaNeural',
  })
  voice: string;
}
