/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 16:21:54
 * @Description: 单词服务类
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Word } from './entities/word.entity';
import { WordTranslation } from './entities/word-translation.entity';
import { WordPhrase } from './entities/word-phrase.entity';
import { WordSentence } from './entities/word-sentence.entity';
import { WordSynonym } from './entities/word-synonym.entity';
import { WordRelatedWord } from './entities/word-related-word.entity';
import { WordBook } from './entities/word-book.entity';
import { replaceFrenchChars, cleanText } from './utils/text.utils';
import { NewWordData, ImportResultDto } from './interfaces/word-data.interface';
import { WordDataDto } from './dto';

@Injectable()
export class WordsService {
  private readonly logger = new Logger(WordsService.name);

  constructor(
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(WordTranslation)
    private readonly wordTranslationRepository: Repository<WordTranslation>,
    @InjectRepository(WordPhrase)
    private readonly wordPhraseRepository: Repository<WordPhrase>,
    @InjectRepository(WordSentence)
    private readonly wordSentenceRepository: Repository<WordSentence>,
    @InjectRepository(WordSynonym)
    private readonly wordSynonymRepository: Repository<WordSynonym>,
    @InjectRepository(WordRelatedWord)
    private readonly wordRelatedWordRepository: Repository<WordRelatedWord>,
    @InjectRepository(WordBook)
    private readonly wordBookRepository: Repository<WordBook>,
  ) {}

  /**
   * 批量导入单词数据
   * @param wordsData 单词数据数组
   * @param source 数据来源（如 BEC_2）
   * @param bookId 单词书ID（可选）
   */
  async importWordsData(
    wordsData: WordDataDto[],
    source?: string,
    bookId?: string,
  ): Promise<ImportResultDto> {
    const results: ImportResultDto = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const wordData of wordsData) {
      try {
        await this.importSingleWord(wordData, source, bookId);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `导入单词 ${wordData.word} 失败: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.error(
          `导入单词 ${wordData.word} 失败:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(
      `单词导入完成: 成功 ${results.success} 个，失败 ${results.failed} 个`,
    );
    return results;
  }

  /**
   * 导入新数据源的单词数据（JSON格式）
   * @param wordsData 新数据源的单词数据数组
   */
  async importNewFormatWordsData(
    wordsData: NewWordData[],
  ): Promise<ImportResultDto> {
    const results: ImportResultDto = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const wordData of wordsData) {
      try {
        await this.importSingleNewFormatWord(wordData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `导入单词 ${wordData.headWord} 失败: ${error instanceof Error ? error.message : String(error)}`,
        );
        this.logger.error(
          `导入单词 ${wordData.headWord} 失败:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(
      `新格式单词导入完成: 成功 ${results.success} 个，失败 ${results.failed} 个`,
    );
    return results;
  }

  /**
   * 导入单个单词及其翻译和短语
   * @param wordData 单词数据
   * @param source 数据来源
   * @param bookId 单词书ID（可选）
   */
  async importSingleWord(
    wordData: WordDataDto,
    source?: string,
    bookId?: string,
  ): Promise<Word> {
    // 检查单词是否已存在（如果提供了bookId，则按单词+单词书组合检查）
    const whereCondition: any = { word: wordData.word };
    if (bookId) {
      whereCondition.book_id = bookId;
    }

    let word = await this.wordRepository.findOne({
      where: whereCondition,
    });

    if (!word) {
      // 创建新单词
      word = this.wordRepository.create({
        word: wordData.word,
        source: source || undefined,
        book_id: bookId || undefined,
      });
      word = await this.wordRepository.save(word);
      this.logger.log(`创建新单词: ${wordData.word}`);
    } else {
      this.logger.log(`单词已存在: ${wordData.word}`);
    }

    // 导入翻译
    if (wordData.translations && wordData.translations.length > 0) {
      for (let i = 0; i < wordData.translations.length; i++) {
        const translation = wordData.translations[i];
        const existingTranslation =
          await this.wordTranslationRepository.findOne({
            where: {
              word_id: word.id,
              translation: translation.translation,
              part_of_speech: translation.type,
            },
          });

        if (!existingTranslation) {
          const newTranslation = this.wordTranslationRepository.create({
            word_id: word.id,
            translation: translation.translation,
            part_of_speech: translation.type,
            sort_order: i,
          });
          await this.wordTranslationRepository.save(newTranslation);
        }
      }
    }

    // 导入短语
    if (wordData.phrases && wordData.phrases.length > 0) {
      for (let i = 0; i < wordData.phrases.length; i++) {
        const phrase = wordData.phrases[i];
        const existingPhrase = await this.wordPhraseRepository.findOne({
          where: {
            word_id: word.id,
            phrase: phrase.phrase,
          },
        });

        if (!existingPhrase) {
          const newPhrase = this.wordPhraseRepository.create({
            word_id: word.id,
            phrase: phrase.phrase,
            translation: phrase.translation,
            sort_order: i,
          });
          await this.wordPhraseRepository.save(newPhrase);
        }
      }
    }

    return word;
  }

  /**
   * 导入新格式的单个单词数据
   * @param wordData 新格式单词数据
   */
  async importSingleNewFormatWord(wordData: NewWordData): Promise<Word> {
    const cleanWord = replaceFrenchChars(cleanText(wordData.headWord));
    const content = wordData.content.word.content;

    // 检查单词是否已存在（按单词+单词书组合检查）
    let word = await this.wordRepository.findOne({
      where: {
        word: cleanWord,
        book_id: wordData.bookId,
      },
    });

    if (!word) {
      // 创建新单词
      word = this.wordRepository.create({
        word_rank: wordData.wordRank,
        word: cleanWord,
        word_id: wordData.content.word.wordId,
        us_phonetic: content.usphone
          ? replaceFrenchChars(content.usphone)
          : undefined,
        uk_phonetic: content.ukphone
          ? replaceFrenchChars(content.ukphone)
          : undefined,
        us_speech: content.usspeech,
        uk_speech: content.ukspeech,
        book_id: wordData.bookId,
        source: 'NEW_FORMAT',
        remember_method: content.remMethod
          ? cleanText(content.remMethod.val)
          : undefined,
      });
      word = await this.wordRepository.save(word);
      this.logger.log(`创建新单词: ${cleanWord}`);
    } else {
      this.logger.log(`单词已存在: ${cleanWord}`);
    }

    // 导入翻译
    if (content.trans && content.trans.length > 0) {
      for (let i = 0; i < content.trans.length; i++) {
        const trans = content.trans[i];
        const cleanTranslation = replaceFrenchChars(cleanText(trans.tranCn));

        const existingTranslation =
          await this.wordTranslationRepository.findOne({
            where: {
              word_id: word.id,
              translation: cleanTranslation,
              part_of_speech: trans.pos || undefined,
            },
          });

        if (!existingTranslation) {
          const newTranslation = this.wordTranslationRepository.create({
            word_id: word.id,
            translation: cleanTranslation,
            part_of_speech: trans.pos || undefined,
            sort_order: i,
          });
          await this.wordTranslationRepository.save(newTranslation);
        }
      }
    }

    // 导入短语
    if (content.phrase && content.phrase.phrases) {
      for (let i = 0; i < content.phrase.phrases.length; i++) {
        const phrase = content.phrase.phrases[i];
        const cleanPhrase = replaceFrenchChars(cleanText(phrase.pContent));
        const cleanPhraseTranslation = replaceFrenchChars(
          cleanText(phrase.pCn),
        );

        const existingPhrase = await this.wordPhraseRepository.findOne({
          where: {
            word_id: word.id,
            phrase: cleanPhrase,
          },
        });

        if (!existingPhrase) {
          const newPhrase = this.wordPhraseRepository.create({
            word_id: word.id,
            phrase: cleanPhrase,
            translation: cleanPhraseTranslation,
            sort_order: i,
          });
          await this.wordPhraseRepository.save(newPhrase);
        }
      }
    }

    // 导入例句
    if (content.sentence && content.sentence.sentences) {
      for (let i = 0; i < content.sentence.sentences.length; i++) {
        const sentence = content.sentence.sentences[i];
        const cleanSentenceEn = replaceFrenchChars(
          cleanText(sentence.sContent),
        );
        const cleanSentenceCn = replaceFrenchChars(cleanText(sentence.sCn));

        const existingSentence = await this.wordSentenceRepository.findOne({
          where: {
            word_id: word.id,
            sentence_en: cleanSentenceEn,
          },
        });

        if (!existingSentence) {
          const newSentence = this.wordSentenceRepository.create({
            word_id: word.id,
            sentence_en: cleanSentenceEn,
            sentence_cn: cleanSentenceCn,
            sort_order: i,
          });
          await this.wordSentenceRepository.save(newSentence);
        }
      }
    }

    // 导入近义词
    if (content.syno && content.syno.synos) {
      for (let i = 0; i < content.syno.synos.length; i++) {
        const syno = content.syno.synos[i];
        const cleanMeaning = replaceFrenchChars(cleanText(syno.tran));

        for (let j = 0; j < syno.hwds.length; j++) {
          const hwd = syno.hwds[j];
          const cleanSynonym = replaceFrenchChars(cleanText(hwd.w));

          const existingSynonym = await this.wordSynonymRepository.findOne({
            where: {
              word_id: word.id,
              synonym_word: cleanSynonym,
              part_of_speech: syno.pos || undefined,
            },
          });

          if (!existingSynonym) {
            const newSynonym = this.wordSynonymRepository.create({
              word_id: word.id,
              part_of_speech: syno.pos || undefined,
              meaning: cleanMeaning,
              synonym_word: cleanSynonym,
              sort_order: i * 100 + j,
            });
            await this.wordSynonymRepository.save(newSynonym);
          }
        }
      }
    }

    // 导入同根词
    if (content.relWord && content.relWord.rels) {
      for (let i = 0; i < content.relWord.rels.length; i++) {
        const rel = content.relWord.rels[i];

        for (let j = 0; j < rel.words.length; j++) {
          const relWord = rel.words[j];
          const cleanRelatedWord = replaceFrenchChars(cleanText(relWord.hwd));
          const cleanMeaning = replaceFrenchChars(cleanText(relWord.tran));

          const existingRelatedWord =
            await this.wordRelatedWordRepository.findOne({
              where: {
                word_id: word.id,
                related_word: cleanRelatedWord,
                part_of_speech: rel.pos,
              },
            });

          if (!existingRelatedWord) {
            const newRelatedWord = this.wordRelatedWordRepository.create({
              word_id: word.id,
              part_of_speech: rel.pos,
              related_word: cleanRelatedWord,
              meaning: cleanMeaning,
              sort_order: i * 100 + j,
            });
            await this.wordRelatedWordRepository.save(newRelatedWord);
          }
        }
      }
    }

    return word;
  }

  /**
   * 根据单词查询完整信息（返回所有匹配的单词记录）
   * @param wordText 单词文本
   * @param bookId 单词书ID（可选，用于筛选特定单词书）
   */
  async getWordInfo(
    wordText: string,
    bookId?: string,
  ): Promise<
    {
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
    }[]
  > {
    const whereCondition: any = { word: wordText, is_active: true };
    if (bookId) {
      whereCondition.book_id = bookId;
    }

    const words = await this.wordRepository.find({
      where: whereCondition,
      order: { word_rank: 'ASC', created_at: 'ASC' },
    });

    if (words.length === 0) {
      return [];
    }

    const results: Array<{
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
    }> = [];
    for (const word of words) {
      const [translations, phrases] = await Promise.all([
        this.wordTranslationRepository.find({
          where: { word_id: word.id },
          order: { sort_order: 'ASC' },
        }),
        this.wordPhraseRepository.find({
          where: { word_id: word.id },
          order: { sort_order: 'ASC' },
        }),
      ]);

      // 更新查看次数（只更新第一个匹配的单词）
      if (results.length === 0) {
        await this.wordRepository.update(word.id, {
          view_count: word.view_count + 1,
        });
      }

      results.push({
        word,
        translations,
        phrases,
      });
    }

    return results;
  }

  /**
   * 搜索单词
   * @param keyword 关键词
   * @param limit 限制数量
   */
  async searchWords(
    keyword: string,
    limit: number = 10,
  ): Promise<
    {
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
    }[]
  > {
    const words = await this.wordRepository
      .createQueryBuilder('word')
      .where('word.word LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('word.is_active = :isActive', { isActive: true })
      .orderBy('word.view_count', 'DESC')
      .limit(limit)
      .getMany();

    const results: {
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
    }[] = [];

    for (const word of words) {
      const translations = await this.wordTranslationRepository.find({
        where: { word_id: word.id },
        order: { sort_order: 'ASC' },
      });

      const phrases = await this.wordPhraseRepository.find({
        where: { word_id: word.id },
        order: { sort_order: 'ASC' },
      });

      results.push({
        word,
        translations,
        phrases,
      });
    }

    return results;
  }

  /**
   * 获取单词统计信息
   */
  async getWordsStats(): Promise<{
    totalWords: number;
    totalTranslations: number;
    totalPhrases: number;
    activeWords: number;
  }> {
    const [totalWords, activeWords, totalTranslations, totalPhrases] =
      await Promise.all([
        this.wordRepository.count(),
        this.wordRepository.count({ where: { is_active: true } }),
        this.wordTranslationRepository.count(),
        this.wordPhraseRepository.count(),
      ]);

    return {
      totalWords,
      totalTranslations,
      totalPhrases,
      activeWords,
    };
  }

  /**
   * 更新单词美式音标
   * @param wordId 单词ID
   * @param usPhonetic 美式音标
   */
  async updateWordUsPhonetic(
    wordId: number,
    usPhonetic: string,
  ): Promise<void> {
    await this.wordRepository.update(wordId, { us_phonetic: usPhonetic });
  }

  /**
   * 更新单词英式音标
   * @param wordId 单词ID
   * @param ukPhonetic 英式音标
   */
  async updateWordUkPhonetic(
    wordId: number,
    ukPhonetic: string,
  ): Promise<void> {
    await this.wordRepository.update(wordId, { uk_phonetic: ukPhonetic });
  }

  /**
   * 更新单词音频URL
   * @param wordId 单词ID
   * @param audioUrl 音频URL
   */
  async updateWordAudioUrl(wordId: number, audioUrl: string): Promise<void> {
    await this.wordRepository.update(wordId, { audio_url: audioUrl });
  }

  /**
   * 软删除单词
   * @param wordId 单词ID
   */
  async softDeleteWord(wordId: number): Promise<void> {
    await this.wordRepository.update(wordId, { is_active: false });
  }

  /**
   * 恢复被软删除的单词
   * @param wordId 单词ID
   */
  async restoreWord(wordId: number): Promise<void> {
    await this.wordRepository.update(wordId, { is_active: true });
  }

  // ==================== 单词书管理方法 ====================

  /**
   * 创建或更新单词书信息
   * @param bookData 单词书数据
   */
  async createOrUpdateWordBook(bookData: {
    book_id: string;
    book_name: string;
    description?: string;
    category?: string;
    difficulty_level?: string;
    target_audience?: string;
    cover_image_url?: string;
    version?: string;
    author?: string;
    release_date?: Date;
    config?: any;
    sort_weight?: number;
  }): Promise<WordBook> {
    let wordBook = await this.wordBookRepository.findOne({
      where: { book_id: bookData.book_id },
    });

    if (wordBook) {
      // 更新现有单词书
      Object.assign(wordBook, bookData);
      wordBook = await this.wordBookRepository.save(wordBook);
      this.logger.log(`更新单词书: ${bookData.book_name}`);
    } else {
      // 创建新单词书
      wordBook = this.wordBookRepository.create({
        ...bookData,
        total_words: 0, // 初始为0，后续统计更新
      });
      wordBook = await this.wordBookRepository.save(wordBook);
      this.logger.log(`创建新单词书: ${bookData.book_name}`);
    }

    return wordBook;
  }

  /**
   * 获取所有单词书列表
   * @param includeInactive 是否包含未启用的单词书
   */
  async getAllWordBooks(includeInactive: boolean = false): Promise<WordBook[]> {
    const whereCondition = includeInactive ? {} : { is_active: true };

    return await this.wordBookRepository.find({
      where: whereCondition,
      order: {
        sort_weight: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  /**
   * 根据分类获取单词书
   * @param category 分类名称
   */
  async getWordBooksByCategory(category: string): Promise<WordBook[]> {
    return await this.wordBookRepository.find({
      where: {
        category: category,
        is_active: true,
      },
      order: {
        sort_weight: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  /**
   * 获取推荐单词书
   */
  async getRecommendedWordBooks(): Promise<WordBook[]> {
    return await this.wordBookRepository.find({
      where: {
        is_recommended: true,
        is_active: true,
      },
      order: {
        sort_weight: 'DESC',
        created_at: 'DESC',
      },
      take: 10, // 最多返回10个推荐
    });
  }

  /**
   * 根据单词书ID获取单词列表
   * @param bookId 单词书ID
   * @param page 页码（从1开始）
   * @param limit 每页数量
   */
  async getWordsByBookId(
    bookId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    words: {
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
      sentences: WordSentence[];
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [words, total] = await this.wordRepository.findAndCount({
      where: {
        book_id: bookId,
        is_active: true,
      },
      order: {
        word_rank: 'ASC',
        word: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    const wordsWithDetails: Array<{
      word: Word;
      translations: WordTranslation[];
      phrases: WordPhrase[];
      sentences: WordSentence[];
    }> = [];
    for (const word of words) {
      const translations = await this.wordTranslationRepository.find({
        where: { word_id: word.id },
        order: { sort_order: 'ASC' },
      });

      const phrases = await this.wordPhraseRepository.find({
        where: { word_id: word.id },
        order: { sort_order: 'ASC' },
      });

      const sentences = await this.wordSentenceRepository.find({
        where: { word_id: word.id },
        order: { sort_order: 'ASC' },
      });

      wordsWithDetails.push({
        word,
        translations,
        phrases,
        sentences,
      });
    }

    return {
      words: wordsWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 更新单词书的单词统计数量
   * @param bookId 单词书ID
   */
  async updateWordBookStats(bookId: string): Promise<void> {
    const wordCount = await this.wordRepository.count({
      where: {
        book_id: bookId,
        is_active: true,
      },
    });

    await this.wordBookRepository.update(
      { book_id: bookId },
      { total_words: wordCount },
    );

    this.logger.log(`更新单词书 ${bookId} 统计: ${wordCount} 个单词`);
  }

  /**
   * 获取单词书的详细统计信息
   * @param bookId 单词书ID
   */
  async getWordBookDetailStats(bookId: string): Promise<{
    book: WordBook;
    stats: {
      totalWords: number;
      totalTranslations: number;
      totalPhrases: number;
      totalSentences: number;
      totalSynonyms: number;
      totalRelatedWords: number;
    };
  } | null> {
    const book = await this.wordBookRepository.findOne({
      where: { book_id: bookId },
    });

    if (!book) {
      return null;
    }

    // 获取该单词书下的所有单词ID
    const words = await this.wordRepository.find({
      where: { book_id: bookId, is_active: true },
      select: ['id'],
    });

    const wordIds = words.map((w) => w.id);

    if (wordIds.length === 0) {
      return {
        book,
        stats: {
          totalWords: 0,
          totalTranslations: 0,
          totalPhrases: 0,
          totalSentences: 0,
          totalSynonyms: 0,
          totalRelatedWords: 0,
        },
      };
    }

    const [
      totalTranslations,
      totalPhrases,
      totalSentences,
      totalSynonyms,
      totalRelatedWords,
    ] = await Promise.all([
      this.wordTranslationRepository.count({
        where: { word_id: wordIds.length > 0 ? In(wordIds) : In([-1]) },
      }),
      this.wordPhraseRepository.count({
        where: { word_id: wordIds.length > 0 ? In(wordIds) : In([-1]) },
      }),
      this.wordSentenceRepository.count({
        where: { word_id: wordIds.length > 0 ? In(wordIds) : In([-1]) },
      }),
      this.wordSynonymRepository.count({
        where: { word_id: wordIds.length > 0 ? In(wordIds) : In([-1]) },
      }),
      this.wordRelatedWordRepository.count({
        where: { word_id: wordIds.length > 0 ? In(wordIds) : In([-1]) },
      }),
    ]);

    return {
      book,
      stats: {
        totalWords: wordIds.length,
        totalTranslations,
        totalPhrases,
        totalSentences,
        totalSynonyms,
        totalRelatedWords,
      },
    };
  }

  /**
   * 设置单词书推荐状态
   * @param bookId 单词书ID
   * @param isRecommended 是否推荐
   */
  async setWordBookRecommended(
    bookId: string,
    isRecommended: boolean,
  ): Promise<void> {
    await this.wordBookRepository.update(
      { book_id: bookId },
      { is_recommended: isRecommended },
    );

    this.logger.log(`设置单词书 ${bookId} 推荐状态: ${isRecommended}`);
  }
}
