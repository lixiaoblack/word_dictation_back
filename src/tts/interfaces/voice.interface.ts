/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: TTS语音配置接口
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */

export interface VoiceConfig {
  name: string;
  gender: 'male' | 'female';
  language: string;
  locale: string;
  description: string;
  preview?: string;
}

export interface TtsOptions {
  voice: string;
  rate: number;
  pitch: number;
  volume?: number;
}

export interface AudioResult {
  buffer: Buffer;
  format: string;
  size: number;
  duration?: number;
}

// 预设语音配置
export const VOICE_PRESETS = {
  // 英语
  EN_US_FEMALE: 'en-US-AriaNeural', // 美式英语女声（推荐）
  EN_US_MALE: 'en-US-BrianNeural', // 美式英语男声
  EN_GB_FEMALE: 'en-GB-SoniaNeural', // 英式英语女声
  EN_GB_MALE: 'en-GB-RyanNeural', // 英式英语男声

  // 中文
  ZH_CN_FEMALE: 'zh-CN-XiaoxiaoNeural', // 中文女声（推荐）
  ZH_CN_MALE: 'zh-CN-YunyangNeural', // 中文男声
};

// 常用语音配置
export const COMMON_VOICES: VoiceConfig[] = [
  {
    name: 'en-US-AriaNeural',
    gender: 'female',
    language: 'English',
    locale: 'en-US',
    description: '美式英语女声（推荐）',
    preview: 'Hello, this is Aria speaking.',
  },
  {
    name: 'en-US-BrianNeural',
    gender: 'male',
    language: 'English',
    locale: 'en-US',
    description: '美式英语男声',
    preview: 'Hello, this is Brian speaking.',
  },
  {
    name: 'en-GB-SoniaNeural',
    gender: 'female',
    language: 'English',
    locale: 'en-GB',
    description: '英式英语女声',
    preview: 'Hello, this is Sonia speaking.',
  },
  {
    name: 'zh-CN-XiaoxiaoNeural',
    gender: 'female',
    language: 'Chinese',
    locale: 'zh-CN',
    description: '中文女声（推荐）',
    preview: '你好，我是晓晓。',
  },
];
