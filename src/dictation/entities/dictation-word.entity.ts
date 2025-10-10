/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:05:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:05:00
 * @Description: 听写单词实体
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

export enum DictationWordStatus {
  PENDING = 'pending', // 待听写
  CORRECT = 'correct', // 正确
  WRONG = 'wrong', // 错误
  SKIPPED = 'skipped', // 跳过
}

@Entity('dictation_words')
@Index('IDX_dictation_word_record_id', ['dictation_record_id'])
@Index('IDX_dictation_word_status', ['status'])
@Index('IDX_dictation_word_word', ['word'])
export class DictationWord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'int', comment: '听写记录ID' })
  dictation_record_id: number;

  @Column({ type: 'varchar', length: 100, comment: '单词文本' })
  word: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '美式音标' })
  us_phonetic: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '英式音标' })
  uk_phonetic: string;

  @Column({ type: 'json', nullable: true, comment: '例句列表' })
  sentences: Array<{
    sentence: string;
    translation: string;
  }>;

  @Column({ type: 'json', nullable: true, comment: '同义词列表' })
  synonyms: Array<{
    word: string;
    translation: string;
  }>;

  @Column({ type: 'json', comment: '翻译列表' })
  translations: Array<{
    translation: string;
    part_of_speech: string;
    is_primary?: boolean; // 是否为主要释义
    source?: string; // 来源：ai_recognition | database
  }>;

  @Column({ type: 'json', nullable: true, comment: '短语列表' })
  phrases: Array<{
    phrase: string;
    translation: string;
  }>;

  @Column({ type: 'json', nullable: true, comment: '相关词汇列表' })
  related_words: Array<{
    word: string;
    translation: string;
    relation_type: string; // 关系类型：synonym, antonym, derivative等
  }>;

  @Column({
    type: 'enum',
    enum: DictationWordStatus,
    default: DictationWordStatus.PENDING,
    comment: '听写状态',
  })
  status: DictationWordStatus;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '用户输入的答案',
  })
  user_answer: string;

  @Column({ type: 'int', default: 0, comment: '用时（秒）' })
  time_spent: number;

  @Column({ type: 'int', default: 0, comment: '单词在听写中的顺序' })
  sort_order: number;

  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  notes: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '中文释义语音文件URL',
  })
  chinese_audio_url: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
