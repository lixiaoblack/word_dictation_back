/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词书表实体
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('word_books')
export class WordBook {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    comment: '单词书ID（如BEC_2, CET4_3）',
  })
  @Index()
  book_id: string;

  @Column({ type: 'varchar', length: 200, comment: '单词书名称' })
  book_name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '单词书描述',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '单词书类别（如：考试、生活、商务）',
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '难度等级（如：初级、中级、高级）',
  })
  difficulty_level: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '目标用户（如：中学生、大学生、职场人士）',
  })
  target_audience: string;

  @Column({ type: 'int', default: 0, comment: '单词总数' })
  total_words: number;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: '封面图片URL',
  })
  cover_image_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '版本号' })
  version: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '作者/出版社',
  })
  author: string;

  @Column({ type: 'date', nullable: true, comment: '发布日期' })
  release_date: Date;

  @Column({ type: 'json', nullable: true, comment: '扩展配置信息（JSON格式）' })
  config: any;

  @Column({ type: 'int', default: 0, comment: '排序权重（数字越大越靠前）' })
  sort_weight: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  is_active: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否推荐' })
  is_recommended: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
