/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词模块
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { Word } from './entities/word.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { WordPhrase } from './entities/word-phrase.entity';
import { WordSentence } from './entities/word-sentence.entity';
import { WordSynonym } from './entities/word-synonym.entity';
import { WordRelatedWord } from './entities/word-related-word.entity';
import { WordBook } from './entities/word-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Word,
      WordTranslation,
      WordPhrase,
      WordSentence,
      WordSynonym,
      WordRelatedWord,
      WordBook,
    ]),
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
