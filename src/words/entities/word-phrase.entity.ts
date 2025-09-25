/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词短语表实体
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

@Entity('word_phrases')
export class WordPhrase {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: '关联的单词ID' })
  @Index()
  word_id: number;

  @Column({ type: 'varchar', length: 200, comment: '短语内容' })
  phrase: string;

  @Column({ type: 'text', comment: '短语翻译' })
  translation: string;

  @Column({ type: 'int', default: 0, comment: '排序字段' })
  sort_order: number;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
