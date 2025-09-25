/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词相关DTO
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class WordTranslationDto {
  @ApiProperty({
    description: '翻译内容',
    example: '药房；配药学，药剂学；制药业；一批备用药品',
  })
  @IsNotEmpty()
  @IsString()
  translation: string;

  @ApiProperty({
    description: '词性',
    example: 'n',
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}

export class WordPhraseDto {
  @ApiProperty({
    description: '短语内容',
    example: 'college of pharmacy',
  })
  @IsNotEmpty()
  @IsString()
  phrase: string;

  @ApiProperty({
    description: '短语翻译',
    example: '药学院；药剂学院',
  })
  @IsNotEmpty()
  @IsString()
  translation: string;
}

export class WordDataDto {
  @ApiProperty({
    description: '单词',
    example: 'pharmacy',
  })
  @IsNotEmpty()
  @IsString()
  word: string;

  @ApiProperty({
    description: '翻译列表',
    type: [WordTranslationDto],
  })
  @IsArray()
  translations: WordTranslationDto[];

  @ApiProperty({
    description: '短语列表',
    type: [WordPhraseDto],
  })
  @IsArray()
  phrases: WordPhraseDto[];
}

export class ImportWordsDto {
  @ApiProperty({
    description: '单词数据列表',
    type: [WordDataDto],
  })
  @IsArray()
  words: WordDataDto[];

  @ApiProperty({
    description: '数据来源',
    example: 'BEC_2',
    required: false,
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    description: '单词书ID',
    example: 'BEC_2',
    required: false,
  })
  @IsOptional()
  @IsString()
  book_id?: string;
}

export class ImportResultDto {
  @ApiProperty({
    description: '成功导入数量',
    example: 10,
  })
  success: number;

  @ApiProperty({
    description: '失败数量',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: '错误信息列表',
    type: [String],
    example: [],
  })
  errors: string[];
}

export class WordInfoResponseDto {
  @ApiProperty({
    description: '单词基本信息',
  })
  word: {
    id: number;
    word: string;
    phonetic: string;
    audio_url: string;
    source: string;
    view_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

  @ApiProperty({
    description: '翻译列表',
    type: 'array',
  })
  translations: {
    id: number;
    translation: string;
    part_of_speech: string;
    sort_order: number;
  }[];

  @ApiProperty({
    description: '短语列表',
    type: 'array',
  })
  phrases: {
    id: number;
    phrase: string;
    translation: string;
    sort_order: number;
  }[];
}
