/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:40:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:40:00
 * @Description: 增强的图片识别服务 - 集成数据库查询
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ImageRecognitionService } from './image-recognition.service';
import { WordsService } from '../words/words.service';
import { WordDetailDto } from '../dictation/dto/dictation.dto';
import { WordInfo, RecognitionResult } from '../types';

@Injectable()
export class EnhancedRecognitionService {
  private readonly logger = new Logger(EnhancedRecognitionService.name);

  constructor(
    private readonly imageRecognitionService: ImageRecognitionService,
    private readonly wordsService: WordsService,
  ) {}

  /**
   * 增强的图片识别 - 包含数据库查询补充信息
   * @param file 图片文件
   * @param provider AI提供商
   */
  async recognizeImageWithEnhancement(
    file: Express.Multer.File,
    provider: 'doubao' | 'deepseek' = 'doubao',
  ): Promise<{
    originalText: string;
    words: WordDetailDto[];
    provider: string;
    confidence?: number;
  }> {
    try {
      // 1. 进行基础图片识别
      const recognitionResult =
        await this.imageRecognitionService.recognizeText(file, provider);

      this.logger.log(
        `图片识别完成，识别到 ${recognitionResult.words.length} 个单词`,
      );

      // 2. 对每个单词进行增强处理
      const enhancedWords: WordDetailDto[] = [];

      for (const wordInfo of recognitionResult.words) {
        const enhancedWord = await this.enhanceWordInfo(wordInfo);
        enhancedWords.push(enhancedWord);
      }

      return {
        originalText: recognitionResult.originalText,
        words: enhancedWords,
        provider: recognitionResult.provider,
        confidence: recognitionResult.confidence,
      };
    } catch (error) {
      this.logger.error('增强图片识别失败:', error);
      throw error;
    }
  }

  /**
   * 增强单词信息 - 检查缺失信息并从数据库补充
   * @param wordInfo 原始单词信息
   */
  private async enhanceWordInfo(wordInfo: WordInfo): Promise<WordDetailDto> {
    try {
      const word = wordInfo.word.toLowerCase().trim();

      // 检查AI识别结果的完整性
      const hasPhonetic = !!wordInfo.phonetic;
      const hasTranslation =
        !!wordInfo.translation && wordInfo.translation !== wordInfo.word;
      const hasPartOfSpeech = !!wordInfo.partOfSpeech;
      const hasDefinitions =
        wordInfo.definitions && wordInfo.definitions.length > 0;

      this.logger.debug(`检查单词 "${word}" 的完整性:`, {
        hasPhonetic,
        hasTranslation,
        hasPartOfSpeech,
        hasDefinitions,
      });

      // 初始化返回结构
      const enhancedWord: WordDetailDto = {
        word: wordInfo.word,
        us_phonetic: undefined,
        uk_phonetic: undefined,
        sentences: [],
        synonyms: [],
        translations: [],
        phrases: [],
        related_words: [],
      };

      // 处理AI识别的翻译信息
      if (hasTranslation && hasPartOfSpeech) {
        enhancedWord.translations.push({
          translation: wordInfo.translation,
          part_of_speech: wordInfo.partOfSpeech || '词汇',
          is_primary: true,
          source: 'ai_recognition',
        });
      }

      // 处理AI识别的音标信息
      if (hasPhonetic) {
        // 简单处理：如果没有明确区分美式/英式，就都赋值
        enhancedWord.us_phonetic = wordInfo.phonetic;
        enhancedWord.uk_phonetic = wordInfo.phonetic;
      }

      // 处理AI识别的例句
      if (wordInfo.examples && wordInfo.examples.length > 0) {
        enhancedWord.sentences = wordInfo.examples.map((example) => ({
          sentence: example,
          translation: '', // AI通常不提供例句翻译
        }));
      }

      // 从数据库查询补充信息
      try {
        const dbWordInfo = await this.wordsService.getWordInfo(word);

        if (dbWordInfo && dbWordInfo.length > 0) {
          this.logger.log(
            `从数据库找到单词 "${word}" 的信息，共 ${dbWordInfo.length} 条记录`,
          );

          for (const dbWord of dbWordInfo) {
            // 补充音标信息
            if (!enhancedWord.us_phonetic && dbWord.word.us_phonetic) {
              enhancedWord.us_phonetic = dbWord.word.us_phonetic;
            }
            if (!enhancedWord.uk_phonetic && dbWord.word.uk_phonetic) {
              enhancedWord.uk_phonetic = dbWord.word.uk_phonetic;
            }

            // 添加数据库中的翻译信息
            if (dbWord.translations && dbWord.translations.length > 0) {
              for (const translation of dbWord.translations) {
                enhancedWord.translations.push({
                  translation: translation.translation,
                  part_of_speech: translation.part_of_speech,
                  is_primary: false,
                  source: 'database',
                });
              }
            }

            // 添加短语信息
            if (dbWord.phrases && dbWord.phrases.length > 0) {
              for (const phrase of dbWord.phrases) {
                enhancedWord.phrases.push({
                  phrase: phrase.phrase,
                  translation: phrase.translation,
                });
              }
            }

            // TODO: 以下功能需要扩展WordsService来支持
            // 例句、同义词、相关词汇暂时留空，后续可扩展
            // 可以通过单独的服务方法获取这些关联数据
          }
        } else {
          this.logger.debug(`数据库中未找到单词 "${word}" 的信息`);
        }
      } catch (dbError) {
        this.logger.warn(`查询数据库中单词 "${word}" 信息失败:`, dbError);
        // 数据库查询失败不影响主流程，继续处理
      }

      // 如果仍然缺少基本翻译信息，提供默认值
      if (enhancedWord.translations.length === 0) {
        enhancedWord.translations.push({
          translation: wordInfo.translation || wordInfo.word,
          part_of_speech: wordInfo.partOfSpeech || '词汇',
          is_primary: true,
          source: 'ai_recognition',
        });
      }

      this.logger.debug(`单词 "${word}" 增强完成:`, {
        translationsCount: enhancedWord.translations.length,
        phrasesCount: enhancedWord.phrases.length,
        sentencesCount: enhancedWord.sentences.length,
        synonymsCount: enhancedWord.synonyms.length,
        relatedWordsCount: enhancedWord.related_words.length,
      });

      return enhancedWord;
    } catch (error) {
      this.logger.error(`增强单词 "${wordInfo.word}" 信息失败:`, error);

      // 出错时返回基本信息
      return {
        word: wordInfo.word,
        us_phonetic: wordInfo.phonetic,
        uk_phonetic: wordInfo.phonetic,
        sentences:
          wordInfo.examples?.map((ex) => ({ sentence: ex, translation: '' })) ||
          [],
        synonyms: [],
        translations: [
          {
            translation: wordInfo.translation || wordInfo.word,
            part_of_speech: wordInfo.partOfSpeech || '词汇',
            is_primary: true,
            source: 'ai_recognition',
          },
        ],
        phrases: [],
        related_words: [],
      };
    }
  }
}
