/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: 文本转语音模块
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { TtsAudioRecord } from './entities/tts-audio.entity';
import { OssService } from '../common/services/oss.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TtsAudioRecord])],
  controllers: [TtsController],
  providers: [TtsService, OssService],
  exports: [TtsService],
})
export class TtsModule {}
