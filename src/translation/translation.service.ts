import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { WordInfo, YoudaoTranslateResponse } from '../types';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly baseUrl = 'https://openapi.youdao.com/api';

  constructor(private configService: ConfigService) {
    this.appKey = this.configService.get<string>('YOUDAO_APP_KEY') || '';
    this.appSecret = this.configService.get<string>('YOUDAO_APP_SECRET') || '';
  }

  private generateSign(query: string, salt: string): string {
    const str = this.appKey + query + salt + this.appSecret;
    return crypto.createHash('md5').update(str).digest('hex');
  }

  async translateWord(word: string): Promise<Partial<WordInfo>> {
    try {
      if (!this.appKey || !this.appSecret) {
        this.logger.warn('有道API配置不完整，使用默认翻译');
        return {
          word: word.toLowerCase(),
          translation: '翻译',
          phonetic: '/ˈwɜːrd/',
        };
      }

      const salt = Date.now().toString();
      const sign = this.generateSign(word, salt);

      const params = {
        q: word,
        from: 'en',
        to: 'zh-CHS',
        appKey: this.appKey,
        salt,
        sign,
      };

      const response = await axios.get<YoudaoTranslateResponse>(this.baseUrl, {
        params,
        timeout: 10000,
      });

      const data = response.data;

      if (data.errorCode !== '0') {
        throw new Error(`有道API错误: ${data.errorCode}`);
      }

      const result: Partial<WordInfo> = {
        word: word.toLowerCase(),
        translation: data.translation?.[0] || word,
        phonetic: data.basic?.phonetic ? `/${data.basic.phonetic}/` : undefined,
        definitions: data.basic?.explains || [],
      };

      return result;
    } catch (error) {
      this.logger.error(`翻译单词 "${word}" 失败:`, error.message);
      // 返回基本信息作为fallback
      return {
        word: word.toLowerCase(),
        translation: word,
        phonetic: undefined,
      };
    }
  }

  async batchTranslateWords(words: string[]): Promise<WordInfo[]> {
    const results: WordInfo[] = [];

    // 去重并过滤有效单词
    const uniqueWords = [...new Set(words)]
      .filter((word) => word && /^[a-zA-Z]+$/.test(word.trim()))
      .map((word) => word.trim().toLowerCase());

    // 并发翻译，但限制并发数量避免API限流
    const batchSize = 5;
    for (let i = 0; i < uniqueWords.length; i += batchSize) {
      const batch = uniqueWords.slice(i, i + batchSize);
      const batchPromises = batch.map((word) => this.translateWord(word));

      try {
        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push({
              word: batch[index],
              phonetic: result.value.phonetic,
              translation: result.value.translation || batch[index],
              partOfSpeech: this.guessPartOfSpeech(batch[index]),
              definitions: result.value.definitions || [],
              examples: [],
            });
          } else {
            this.logger.error(
              `翻译单词 "${batch[index]}" 失败:`,
              result.reason,
            );
            results.push({
              word: batch[index],
              translation: batch[index],
              partOfSpeech: this.guessPartOfSpeech(batch[index]),
              definitions: [],
              examples: [],
            });
          }
        });
      } catch (error) {
        this.logger.error('批量翻译失败:', error.message);
      }

      // 添加延迟避免API限流
      if (i + batchSize < uniqueWords.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  private guessPartOfSpeech(word: string): string {
    // 简单的词性推测逻辑
    const verbEndings = ['ing', 'ed', 'er', 'est'];
    const nounEndings = ['tion', 'sion', 'ness', 'ment', 'ity', 'ty'];
    const adjEndings = ['ful', 'less', 'ous', 'ive', 'al', 'ic'];

    const lowerWord = word.toLowerCase();

    if (verbEndings.some((ending) => lowerWord.endsWith(ending))) {
      return '动词';
    }
    if (nounEndings.some((ending) => lowerWord.endsWith(ending))) {
      return '名词';
    }
    if (adjEndings.some((ending) => lowerWord.endsWith(ending))) {
      return '形容词';
    }

    return '词汇'; // 默认
  }

  extractWordsFromText(text: string): string[] {
    // 使用正则表达式提取英文单词
    const wordRegex = /\b[a-zA-Z]+\b/g;
    const matches = text.match(wordRegex) || [];

    // 过滤掉太短的单词和常见的停用词
    const stopWords = new Set([
      'a',
      'an',
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'must',
    ]);

    return matches
      .filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
      .map((word) => word.toLowerCase());
  }
}
