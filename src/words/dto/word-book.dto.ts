/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:25:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:25:00
 * @Description: 单词书相关DTO
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateWordBookDto {
  @ApiProperty({ description: '单词书ID' })
  @IsString()
  book_id: string;

  @ApiProperty({ description: '单词书名称' })
  @IsString()
  book_name: string;

  @ApiProperty({ description: '描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '分类', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: '难度等级', required: false })
  @IsOptional()
  @IsString()
  difficulty_level?: string;

  @ApiProperty({ description: '目标受众', required: false })
  @IsOptional()
  @IsString()
  target_audience?: string;

  @ApiProperty({ description: '封面图片URL', required: false })
  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @ApiProperty({ description: '版本', required: false })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ description: '作者', required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: '发布日期', required: false })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty({ description: '排序权重', required: false })
  @IsOptional()
  @IsNumber()
  sort_weight?: number;
}

export class WordBookListQueryDto {
  @ApiProperty({
    description: '是否包含未启用的单词书',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  include_inactive?: boolean = false;

  @ApiProperty({ description: '分类过滤', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}

export class WordBookWordsQueryDto {
  @ApiProperty({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', default: 50, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 50;
}

export class SetRecommendedDto {
  @ApiProperty({ description: '是否推荐' })
  @IsBoolean()
  is_recommended: boolean;
}
