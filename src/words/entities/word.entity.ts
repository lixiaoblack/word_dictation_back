/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词主表实体 - 适配新数据源
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

@Entity('words')
@Index('IDX_word_book', ['word', 'book_id'], { unique: true })
export class Word {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', nullable: true, comment: '单词排序号' })
  word_rank: number;

  @Column({ type: 'varchar', length: 100, comment: '单词文本' })
  @Index()
  word: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '单词ID' })
  word_id: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '美式音标' })
  us_phonetic: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '英式音标' })
  uk_phonetic: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '美式发音URL参数',
  })
  us_speech: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '英式发音URL参数',
  })
  uk_speech: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '音频文件URL',
  })
  audio_url: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '单词书ID' })
  book_id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '数据来源标识',
  })
  source: string;

  @Column({ type: 'text', nullable: true, comment: '记忆方法' })
  remember_method: string;

  @Column({ type: 'int', default: 0, comment: '查看次数' })
  view_count: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  is_active: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
