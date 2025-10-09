/*
 * @Author: wanglx
 * @Date: 2025-10-09 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-10-09 20:00:00
 * @Description: TTS音频记录实体
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

export enum AudioType {
  WORD = 'word', // 单词发音
  SENTENCE = 'sentence', // 句子语音
  TEXT = 'text', // 普通文本
  BATCH = 'batch', // 批量生成
}

export enum AudioStatus {
  PENDING = 'pending', // 待生成
  GENERATING = 'generating', // 生成中
  COMPLETED = 'completed', // 已完成
  FAILED = 'failed', // 生成失败
}

@Entity('tts_audio_records')
@Index('IDX_tts_content_hash', ['content_hash'], { unique: true })
@Index('IDX_tts_text_voice', ['text', 'voice'])
@Index('IDX_tts_type', ['type'])
@Index('IDX_tts_status', ['status'])
@Index('IDX_tts_created_at', ['created_at'])
export class TtsAudioRecord {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'varchar',
    length: 64,
    unique: true,
    comment: '内容哈希值，用于去重',
  })
  content_hash: string;

  @Column({ type: 'text', comment: '原始文本内容' })
  text: string;

  @Column({ type: 'varchar', length: 100, comment: '使用的语音' })
  voice: string;

  @Column({
    type: 'enum',
    enum: AudioType,
    default: AudioType.TEXT,
    comment: '音频类型',
  })
  type: AudioType;

  @Column({
    type: 'enum',
    enum: AudioStatus,
    default: AudioStatus.PENDING,
    comment: '生成状态',
  })
  status: AudioStatus;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
    comment: '语速',
  })
  rate: number;

  @Column({ type: 'int', default: 0, comment: '音调' })
  pitch: number;

  @Column({ type: 'int', default: 100, comment: '音量' })
  volume: number;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'OSS文件URL',
  })
  file_url: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'OSS文件路径',
  })
  file_path: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '文件名',
  })
  file_name: string;

  @Column({ type: 'int', default: 0, comment: '文件大小（字节）' })
  file_size: number;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    comment: '音频时长（秒）',
  })
  duration: number | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'audio/mpeg',
    comment: '音频格式',
  })
  format: string;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usage_count: number;

  @Column({
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '创建者用户ID',
  })
  created_by: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '错误信息（生成失败时）',
  })
  error_message: string | null;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updated_at: Date;

  @Column({
    type: 'datetime',
    nullable: true,
    comment: '最后使用时间',
  })
  last_used_at: Date | null;
}
