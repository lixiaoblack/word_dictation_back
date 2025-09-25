/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:10:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:10:00
 * @Description: 错题本实体
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

@Entity('wrong_words')
@Index('IDX_wrong_word_user_id', ['user_id'])
@Index('IDX_wrong_word_word', ['word'])
@Index('IDX_wrong_word_review_status', ['review_status'])
export class WrongWord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: true, comment: '用户ID' })
  user_id: string;

  @Column({ type: 'int', comment: '原听写记录ID' })
  dictation_record_id: number;

  @Column({ type: 'int', comment: '原听写单词ID' })
  dictation_word_id: number;

  @Column({ type: 'varchar', length: 100, comment: '单词文本' })
  word: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '用户错误答案',
  })
  wrong_answer: string;

  @Column({ type: 'varchar', length: 100, comment: '正确答案' })
  correct_answer: string;

  @Column({ type: 'json', comment: '单词详细信息（快照）' })
  word_details: {
    us_phonetic?: string;
    uk_phonetic?: string;
    translations: Array<{
      translation: string;
      part_of_speech: string;
    }>;
    sentences?: Array<{
      sentence: string;
      translation: string;
    }>;
    synonyms?: Array<{
      word: string;
      translation: string;
    }>;
    phrases?: Array<{
      phrase: string;
      translation: string;
    }>;
  };

  @Column({ type: 'int', default: 0, comment: '错误次数' })
  error_count: number;

  @Column({ type: 'boolean', default: false, comment: '是否已复习' })
  is_reviewed: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'reviewing', 'mastered'],
    default: 'pending',
    comment: '复习状态：待复习、复习中、已掌握',
  })
  review_status: 'pending' | 'reviewing' | 'mastered';

  @Column({ type: 'timestamp', nullable: true, comment: '最后复习时间' })
  last_reviewed_at: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '下次复习时间' })
  next_review_at: Date;

  @Column({ type: 'text', nullable: true, comment: '错误分析备注' })
  error_notes: string;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
