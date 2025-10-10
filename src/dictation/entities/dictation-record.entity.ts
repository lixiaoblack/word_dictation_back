/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-10-10 10:48:00
 * @Description: 听写记录实体
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

export enum DictationStatus {
  CREATED = 'created', // 已创建
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed', // 已完成
  PAUSED = 'paused', // 已暂停
}

export enum QuestionType {
  CHINESE = 'chinese', // 中文提问
  ENGLISH = 'english', // 英文提问
  NO_QUESTION = 'no_question', // 无提问
}

export enum SwitchMode {
  AUTO = 'auto', // 自动切换
  MANUAL = 'manual', // 手动切换
}

export enum InputMethod {
  KEYBOARD = 'keyboard', // 键盘输入
  PHOTO = 'photo', // 拍照识别
}

@Entity('dictation_records')
@Index('IDX_dictation_user_id', ['user_id'])
@Index('IDX_dictation_status', ['status'])
@Index('IDX_dictation_created_at', ['created_at'])
export class DictationRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: true, comment: '用户ID' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, comment: '封面图' })
  cover_url: string;

  @Column({ type: 'varchar', length: 100, comment: '听写名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '听写描述' })
  description: string;

  @Column({
    type: 'enum',
    enum: DictationStatus,
    default: DictationStatus.CREATED,
    comment: '听写状态',
  })
  status: DictationStatus;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.CHINESE,
    comment: '听写类型：中文提问、英文提问、无提问',
  })
  question_type: QuestionType;

  @Column({
    type: 'int',
    default: 10,
    comment: '单个单词听写时间（秒）',
  })
  word_time_limit: number;

  @Column({
    type: 'enum',
    enum: SwitchMode,
    default: SwitchMode.AUTO,
    comment: '切换模式：自动切换、手动切换',
  })
  switch_mode: SwitchMode;

  @Column({
    type: 'enum',
    enum: InputMethod,
    default: InputMethod.KEYBOARD,
    comment: '输入方式：键盘输入、拍照识别',
  })
  input_method: InputMethod;

  @Column({ type: 'int', default: 0, comment: '总单词数量' })
  total_words: number;

  @Column({ type: 'int', default: 0, comment: '正确单词数量' })
  correct_words: number;

  @Column({ type: 'int', default: 0, comment: '错误单词数量' })
  wrong_words: number;

  @Column({ type: 'float', default: 0, comment: '正确率（百分比）' })
  accuracy_rate: number;

  @Column({ type: 'int', default: 0, comment: '用时（秒）' })
  duration_seconds: number;

  @Column({ type: 'timestamp', nullable: true, comment: '开始时间' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '完成时间' })
  completed_at: Date;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;
}
