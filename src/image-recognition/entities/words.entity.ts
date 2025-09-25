/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词主表实体
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
export class Word {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '单词' })
  @Index()
  word: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '音标' })
  phonetic: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '读音文件URL',
  })
  audio_url: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '词汇来源（如BEC_2）',
  })
  source: string;

  @Column({ type: 'int', default: 0, comment: '查看次数' })
  view_count: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  is_active: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
