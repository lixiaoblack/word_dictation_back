/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:15:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:15:00
 * @Description: 听写相关DTO
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  QuestionType,
  SwitchMode,
  InputMethod,
  DictationStatus,
} from '../entities/dictation-record.entity';
import { DictationWordStatus } from '../entities/dictation-word.entity';

// 单词详细信息DTO（统一返回格式）
export class WordDetailDto {
  @ApiProperty({ description: '单词文本', example: 'hello' })
  @IsString()
  word: string;

  @ApiPropertyOptional({ description: '美式音标', example: '/həˈloʊ/' })
  @IsOptional()
  @IsString()
  us_phonetic?: string;

  @ApiPropertyOptional({ description: '英式音标', example: '/həˈləʊ/' })
  @IsOptional()
  @IsString()
  uk_phonetic?: string;

  @ApiProperty({
    description: '例句列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        sentence: { type: 'string', example: 'Hello, how are you?' },
        translation: { type: 'string', example: '你好，你好吗？' },
      },
    },
  })
  @IsArray()
  sentences: Array<{
    sentence: string;
    translation: string;
  }>;

  @ApiProperty({
    description: '同义词列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        word: { type: 'string', example: 'hi' },
        translation: { type: 'string', example: '嗨' },
      },
    },
  })
  @IsArray()
  synonyms: Array<{
    word: string;
    translation: string;
  }>;

  @ApiProperty({
    description: '翻译列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        translation: { type: 'string', example: '你好' },
        part_of_speech: { type: 'string', example: '感叹词' },
        is_primary: { type: 'boolean', example: true },
        source: { type: 'string', example: 'ai_recognition' },
      },
    },
  })
  @IsArray()
  translations: Array<{
    translation: string;
    part_of_speech: string;
    is_primary?: boolean;
    source?: string;
  }>;

  @ApiProperty({
    description: '短语列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        phrase: { type: 'string', example: 'hello world' },
        translation: { type: 'string', example: '你好世界' },
      },
    },
  })
  @IsArray()
  phrases: Array<{
    phrase: string;
    translation: string;
  }>;

  @ApiProperty({
    description: '相关词汇列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        word: { type: 'string', example: 'greeting' },
        translation: { type: 'string', example: '问候' },
        relation_type: { type: 'string', example: 'synonym' },
      },
    },
  })
  @IsArray()
  related_words: Array<{
    word: string;
    translation: string;
    relation_type: string;
  }>;
}

// 创建听写记录DTO
export class CreateDictationDto {
  @ApiProperty({ description: '听写名称', example: '第一次听写练习' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '听写描述', example: '基础单词听写练习' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '听写类型',
    enum: QuestionType,
    example: QuestionType.CHINESE,
  })
  @IsEnum(QuestionType)
  question_type: QuestionType;

  @ApiProperty({
    description: '单个单词听写时间（秒）',
    example: 10,
    minimum: 5,
    maximum: 60,
  })
  @IsInt()
  @Min(5)
  @Max(60)
  word_time_limit: number;

  @ApiProperty({
    description: '切换模式',
    enum: SwitchMode,
    example: SwitchMode.AUTO,
  })
  @IsEnum(SwitchMode)
  switch_mode: SwitchMode;

  @ApiProperty({
    description: '输入方式',
    enum: InputMethod,
    example: InputMethod.KEYBOARD,
  })
  @IsEnum(InputMethod)
  input_method: InputMethod;

  @ApiProperty({
    description: '单词列表',
    type: [WordDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordDetailDto)
  words: WordDetailDto[];
}

// 听写设置DTO
export class DictationSettingsDto {
  @ApiProperty({
    description: '听写类型',
    enum: QuestionType,
    example: QuestionType.CHINESE,
  })
  @IsEnum(QuestionType)
  question_type: QuestionType;

  @ApiProperty({
    description: '单个单词听写时间（秒）',
    example: 10,
    minimum: 5,
    maximum: 60,
  })
  @IsInt()
  @Min(5)
  @Max(60)
  word_time_limit: number;

  @ApiProperty({
    description: '切换模式',
    enum: SwitchMode,
    example: SwitchMode.AUTO,
  })
  @IsEnum(SwitchMode)
  switch_mode: SwitchMode;

  @ApiProperty({
    description: '输入方式',
    enum: InputMethod,
    example: InputMethod.KEYBOARD,
  })
  @IsEnum(InputMethod)
  input_method: InputMethod;
}

// 听写答案提交DTO
export class SubmitDictationAnswerDto {
  @ApiProperty({ description: '听写单词ID', example: 1 })
  @IsInt()
  dictation_word_id: number;

  @ApiProperty({ description: '用户答案', example: 'hello' })
  @IsString()
  user_answer: string;

  @ApiProperty({ description: '用时（秒）', example: 8 })
  @IsInt()
  @Min(0)
  time_spent: number;

  @ApiPropertyOptional({ description: '备注', example: '有点记不清楚' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// 听写记录查询DTO
export class DictationRecordQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: '听写状态筛选',
    enum: DictationStatus,
    example: DictationStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(DictationStatus)
  status?: DictationStatus;

  @ApiPropertyOptional({ description: '听写名称关键词搜索', example: '第一次' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

// 听写记录响应DTO
export class DictationRecordResponseDto {
  @ApiProperty({ description: '听写记录ID', example: 1 })
  id: number;

  @ApiProperty({ description: '听写名称', example: '第一次听写练习' })
  name: string;

  @ApiPropertyOptional({ description: '听写描述', example: '基础单词听写练习' })
  description?: string;

  @ApiProperty({
    description: '听写状态',
    enum: DictationStatus,
    example: DictationStatus.COMPLETED,
  })
  status: DictationStatus;

  @ApiProperty({ description: '听写设置', type: DictationSettingsDto })
  settings: DictationSettingsDto;

  @ApiProperty({ description: '总单词数量', example: 20 })
  total_words: number;

  @ApiProperty({ description: '正确单词数量', example: 18 })
  correct_words: number;

  @ApiProperty({ description: '错误单词数量', example: 2 })
  wrong_words: number;

  @ApiProperty({ description: '正确率（百分比）', example: 90.0 })
  accuracy_rate: number;

  @ApiProperty({ description: '用时（秒）', example: 180 })
  duration_seconds: number;

  @ApiPropertyOptional({
    description: '开始时间',
    example: '2025-09-25T18:00:00Z',
  })
  started_at?: Date;

  @ApiPropertyOptional({
    description: '完成时间',
    example: '2025-09-25T18:03:00Z',
  })
  completed_at?: Date;

  @ApiProperty({ description: '创建时间', example: '2025-09-25T17:55:00Z' })
  created_at: Date;
}
