/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词例句表实体
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

@Entity('word_sentences')
export class WordSentence {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: '关联的单词ID' })
  @Index()
  word_id: number;

  @Column({ type: 'text', comment: '英文例句' })
  sentence_en: string;

  @Column({ type: 'text', comment: '中文翻译' })
  sentence_cn: string;

  @Column({ type: 'int', default: 0, comment: '排序字段' })
  sort_order: number;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
