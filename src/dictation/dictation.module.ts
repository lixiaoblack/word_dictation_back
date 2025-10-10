/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:35:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:35:00
 * @Description: 听写模块
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictationController } from './dictation.controller';
import { DictationService } from './dictation.service';
import { DictationRecord } from './entities/dictation-record.entity';
import { DictationWord } from './entities/dictation-word.entity';
import { WrongWord } from './entities/wrong-word.entity';
import { WordsModule } from '../words/words.module';
import { TtsModule } from '../tts/tts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DictationRecord, DictationWord, WrongWord]),
    WordsModule, // 导入单词模块以使用WordsService
    TtsModule, // 导入TTS模块以使用TtsService
  ],
  controllers: [DictationController],
  providers: [DictationService],
  exports: [DictationService],
})
export class DictationModule {}
