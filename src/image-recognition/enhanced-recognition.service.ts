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
import { TtsService } from '../tts/tts.service';
import { WordDetailDto } from '../dictation/dto/dictation.dto';
import { WordInfo, RecognitionResult } from '../types';

@Injectable()
export class EnhancedRecognitionService {
  private readonly logger = new Logger(EnhancedRecognitionService.name);

  constructor(
    private readonly imageRecognitionService: ImageRecognitionService,
    private readonly wordsService: WordsService,
    private readonly ttsService: TtsService,
  ) {}

  /**
   * 增强的图片识别 - 包含数据库查询补充信息和可选的语音生成
   * @param file 图片文件
   * @param provider AI提供商
   * @param generateAudio 是否生成语音
   */
  async recognizeImageWithEnhancement(
    file: Express.Multer.File,
    provider: 'doubao' | 'deepseek' = 'doubao',
    generateAudio: boolean = false,
  ): Promise<{
    originalText: string;
    words: WordDetailDto[];
    provider: string;
    confidence?: number;
    audioData?: { [word: string]: string }; // 新增音频数据
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

      // 3. 生成语音（可选）
      let audioData: { [word: string]: string } | undefined;
      if (generateAudio) {
        audioData = await this.generateWordsAudio(enhancedWords);
      }

      return {
        originalText: recognitionResult.originalText,
        words: enhancedWords,
        provider: recognitionResult.provider,
        confidence: recognitionResult.confidence,
        audioData,
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

            // 添加数据库中的翻译信息（去重处理）
            if (dbWord.translations && dbWord.translations.length > 0) {
              for (const translation of dbWord.translations) {
                // 检查是否已存在相同的翻译（基于translation和part_of_speech）
                const isDuplicate = enhancedWord.translations.some(
                  (existing) =>
                    existing.translation === translation.translation &&
                    existing.part_of_speech === translation.part_of_speech,
                );

                if (!isDuplicate) {
                  enhancedWord.translations.push({
                    translation: translation.translation,
                    part_of_speech: translation.part_of_speech,
                    is_primary: false,
                    source: 'database',
                  });
                }
              }
            }

            // 添加短语信息（最多5个）
            if (dbWord.phrases && dbWord.phrases.length > 0) {
              const maxPhrases = 5;
              const currentPhrasesCount = enhancedWord.phrases.length;
              const remainingSlots = Math.max(
                0,
                maxPhrases - currentPhrasesCount,
              );

              if (remainingSlots > 0) {
                const phrasesToAdd = dbWord.phrases.slice(0, remainingSlots);
                for (const phrase of phrasesToAdd) {
                  enhancedWord.phrases.push({
                    phrase: phrase.phrase,
                    translation: phrase.translation,
                  });
                }
              }

              if (dbWord.phrases.length > remainingSlots) {
                this.logger.log(
                  `单词 "${word}" 的短语信息过多，已限制为前${maxPhrases}个（当前已有${currentPhrasesCount}个，新增${remainingSlots}个）`,
                );
              }
            }

            // 添加例句信息（最多3条）
            if (dbWord.sentences && dbWord.sentences.length > 0) {
              const maxSentences = 3;
              const currentSentencesCount = enhancedWord.sentences.length;
              const remainingSlots = Math.max(
                0,
                maxSentences - currentSentencesCount,
              );

              if (remainingSlots > 0) {
                const sentencesToAdd = dbWord.sentences.slice(
                  0,
                  remainingSlots,
                );
                for (const sentence of sentencesToAdd) {
                  enhancedWord.sentences.push({
                    sentence: sentence.sentence_en,
                    translation: sentence.sentence_cn,
                  });
                }
              }

              if (dbWord.sentences.length > remainingSlots) {
                this.logger.log(
                  `单词 "${word}" 的例句信息过多，已限制为前${maxSentences}条（当前已有${currentSentencesCount}条，新增${remainingSlots}条）`,
                );
              }
            }

            // TODO: 以下功能需要扩展WordsService来支持
            // 同义词、相关词汇暂时留空，后续可扩展
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

      // 最终的翻译去重处理（防止任何漏网的重复）
      const translationMap = new Map<string, any>();
      for (const translation of enhancedWord.translations) {
        const key = `${translation.translation}|${translation.part_of_speech}`;
        if (!translationMap.has(key)) {
          translationMap.set(key, translation);
        } else {
          // 如果重复，保留is_primary为true的，或者保留第一个
          const existing = translationMap.get(key);
          if (translation.is_primary && !existing.is_primary) {
            translationMap.set(key, translation);
          }
        }
      }
      enhancedWord.translations = Array.from(translationMap.values());

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

  /**
   * 为单词列表生成语音
   * @param words 单词列表
   */
  private async generateWordsAudio(
    words: WordDetailDto[],
  ): Promise<{ [word: string]: string }> {
    const audioData: { [word: string]: string } = {};

    this.logger.log(`开始为 ${words.length} 个单词生成语音`);

    for (const wordDetail of words) {
      try {
        const audioResult = await this.ttsService.wordPronunciation(
          wordDetail.word,
          'en-US-AriaNeural', // 英文发音
          1.0, // 正常语速
        );

        // 转为Base64格式
        audioData[wordDetail.word] =
          `data:audio/mpeg;base64,${audioResult.buffer.toString('base64')}`;

        this.logger.debug(
          `单词 "${wordDetail.word}" 语音生成成功，大小: ${audioResult.size} 字节`,
        );
      } catch (error) {
        this.logger.warn(`为单词 "${wordDetail.word}" 生成语音失败:`, error);
        // 失败的单词不影响其他单词的处理
      }
    }

    this.logger.log(
      `语音生成完成，成功 ${Object.keys(audioData).length}/${words.length} 个单词`,
    );
    return audioData;
  }
}
