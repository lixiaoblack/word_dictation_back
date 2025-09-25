/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:20:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 18:20:00
 * @Description: 听写服务类
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  DictationRecord,
  DictationStatus,
} from './entities/dictation-record.entity';
import {
  DictationWord,
  DictationWordStatus,
} from './entities/dictation-word.entity';
import { WrongWord } from './entities/wrong-word.entity';
import { WordsService } from '../words/words.service';
import {
  CreateDictationDto,
  DictationRecordQueryDto,
  DictationRecordResponseDto,
  SubmitDictationAnswerDto,
  WordDetailDto,
} from './dto/dictation.dto';

@Injectable()
export class DictationService {
  private readonly logger = new Logger(DictationService.name);

  constructor(
    @InjectRepository(DictationRecord)
    private readonly dictationRecordRepository: Repository<DictationRecord>,
    @InjectRepository(DictationWord)
    private readonly dictationWordRepository: Repository<DictationWord>,
    @InjectRepository(WrongWord)
    private readonly wrongWordRepository: Repository<WrongWord>,
    private readonly wordsService: WordsService,
  ) {}

  /**
   * 创建听写记录
   * @param createDictationDto 创建听写记录DTO
   * @param userId 用户ID
   */
  async createDictationRecord(
    createDictationDto: CreateDictationDto,
    userId?: string,
  ): Promise<DictationRecord> {
    try {
      // 创建听写记录
      const dictationRecord = this.dictationRecordRepository.create({
        user_id: userId,
        name: createDictationDto.name,
        description: createDictationDto.description,
        question_type: createDictationDto.question_type,
        word_time_limit: createDictationDto.word_time_limit,
        switch_mode: createDictationDto.switch_mode,
        input_method: createDictationDto.input_method,
        total_words: createDictationDto.words.length,
        status: DictationStatus.CREATED,
      });

      const savedRecord =
        await this.dictationRecordRepository.save(dictationRecord);

      // 创建听写单词记录
      for (let i = 0; i < createDictationDto.words.length; i++) {
        const wordDetail = createDictationDto.words[i];
        const dictationWord = this.dictationWordRepository.create({
          dictation_record_id: savedRecord.id,
          word: wordDetail.word,
          us_phonetic: wordDetail.us_phonetic,
          uk_phonetic: wordDetail.uk_phonetic,
          sentences: wordDetail.sentences,
          synonyms: wordDetail.synonyms,
          translations: wordDetail.translations,
          phrases: wordDetail.phrases,
          related_words: wordDetail.related_words,
          sort_order: i,
          status: DictationWordStatus.PENDING,
        });
        await this.dictationWordRepository.save(dictationWord);
      }

      this.logger.log(
        `创建听写记录成功: ${savedRecord.id}, 包含 ${createDictationDto.words.length} 个单词`,
      );
      return savedRecord;
    } catch (error) {
      this.logger.error('创建听写记录失败:', error);
      throw error;
    }
  }

  /**
   * 开始听写（更新状态和开始时间）
   * @param dictationId 听写记录ID
   * @param userId 用户ID
   */
  async startDictation(
    dictationId: number,
    userId?: string,
  ): Promise<DictationRecord> {
    const dictationRecord = await this.dictationRecordRepository.findOne({
      where: { id: dictationId, user_id: userId },
    });

    if (!dictationRecord) {
      throw new NotFoundException('听写记录不存在');
    }

    if (dictationRecord.status !== DictationStatus.CREATED) {
      throw new Error('听写记录状态不正确，无法开始');
    }

    dictationRecord.status = DictationStatus.IN_PROGRESS;
    dictationRecord.started_at = new Date();

    return await this.dictationRecordRepository.save(dictationRecord);
  }

  /**
   * 提交听写答案
   * @param submitAnswerDto 答案提交DTO
   * @param userId 用户ID
   */
  async submitDictationAnswer(
    submitAnswerDto: SubmitDictationAnswerDto,
    userId?: string,
  ): Promise<{ isCorrect: boolean; correctAnswer: string }> {
    const dictationWord = await this.dictationWordRepository.findOne({
      where: { id: submitAnswerDto.dictation_word_id },
      relations: [],
    });

    if (!dictationWord) {
      throw new NotFoundException('听写单词记录不存在');
    }

    // 验证听写记录是否属于当前用户
    const dictationRecord = await this.dictationRecordRepository.findOne({
      where: { id: dictationWord.dictation_record_id, user_id: userId },
    });

    if (!dictationRecord) {
      throw new NotFoundException('听写记录不存在或无权限');
    }

    // 判断答案是否正确（忽略大小写）
    const isCorrect =
      submitAnswerDto.user_answer.toLowerCase().trim() ===
      dictationWord.word.toLowerCase().trim();

    // 更新听写单词记录
    dictationWord.user_answer = submitAnswerDto.user_answer;
    dictationWord.time_spent = submitAnswerDto.time_spent;
    dictationWord.notes = submitAnswerDto.notes || null;
    dictationWord.status = isCorrect
      ? DictationWordStatus.CORRECT
      : DictationWordStatus.WRONG;

    await this.dictationWordRepository.save(dictationWord);

    // 如果答案错误，添加到错题本
    if (!isCorrect) {
      await this.addToWrongWords(dictationWord, userId);
    }

    // 更新听写记录统计
    await this.updateDictationStats(dictationRecord.id);

    return {
      isCorrect,
      correctAnswer: dictationWord.word,
    };
  }

  /**
   * 完成听写
   * @param dictationId 听写记录ID
   * @param userId 用户ID
   */
  async completeDictation(
    dictationId: number,
    userId?: string,
  ): Promise<DictationRecord> {
    const dictationRecord = await this.dictationRecordRepository.findOne({
      where: { id: dictationId, user_id: userId },
    });

    if (!dictationRecord) {
      throw new NotFoundException('听写记录不存在');
    }

    dictationRecord.status = DictationStatus.COMPLETED;
    dictationRecord.completed_at = new Date();

    if (dictationRecord.started_at) {
      dictationRecord.duration_seconds = Math.floor(
        (dictationRecord.completed_at.getTime() -
          dictationRecord.started_at.getTime()) /
          1000,
      );
    }

    await this.updateDictationStats(dictationId);
    return await this.dictationRecordRepository.save(dictationRecord);
  }

  /**
   * 分页查询听写记录
   * @param queryDto 查询条件DTO
   * @param userId 用户ID
   */
  async getDictationRecords(
    queryDto: DictationRecordQueryDto,
    userId?: string,
  ): Promise<{ records: DictationRecordResponseDto[]; total: number }> {
    const { page = 1, pageSize = 10, status, keyword } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.dictationRecordRepository
      .createQueryBuilder('dr')
      .where('dr.user_id = :userId OR dr.user_id IS NULL', { userId });

    if (status) {
      queryBuilder.andWhere('dr.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere('dr.name LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    const [records, total] = await queryBuilder
      .orderBy('dr.created_at', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const responseRecords: DictationRecordResponseDto[] = records.map(
      (record) => ({
        id: record.id,
        name: record.name,
        description: record.description,
        status: record.status,
        settings: {
          question_type: record.question_type,
          word_time_limit: record.word_time_limit,
          switch_mode: record.switch_mode,
          input_method: record.input_method,
        },
        total_words: record.total_words,
        correct_words: record.correct_words,
        wrong_words: record.wrong_words,
        accuracy_rate: record.accuracy_rate,
        duration_seconds: record.duration_seconds,
        started_at: record.started_at,
        completed_at: record.completed_at,
        created_at: record.created_at,
      }),
    );

    return { records: responseRecords, total };
  }

  /**
   * 获取听写详情
   * @param dictationId 听写记录ID
   * @param userId 用户ID
   */
  async getDictationDetail(dictationId: number, userId?: string): Promise<any> {
    const dictationRecord = await this.dictationRecordRepository.findOne({
      where: { id: dictationId, user_id: userId },
    });

    if (!dictationRecord) {
      throw new NotFoundException('听写记录不存在');
    }

    const dictationWords = await this.dictationWordRepository.find({
      where: { dictation_record_id: dictationId },
      order: { sort_order: 'ASC' },
    });

    return {
      record: dictationRecord,
      words: dictationWords,
    };
  }

  /**
   * 添加到错题本
   * @param dictationWord 听写单词记录
   * @param userId 用户ID
   */
  private async addToWrongWords(
    dictationWord: DictationWord,
    userId?: string,
  ): Promise<void> {
    try {
      // 检查是否已存在该错题
      const existingWrongWord = await this.wrongWordRepository.findOne({
        where: {
          user_id: userId,
          word: dictationWord.word,
        },
      });

      if (existingWrongWord) {
        // 更新错误次数
        existingWrongWord.error_count += 1;
        existingWrongWord.wrong_answer = dictationWord.user_answer;
        existingWrongWord.review_status = 'pending';
        await this.wrongWordRepository.save(existingWrongWord);
      } else {
        // 创建新的错题记录
        const wrongWord = this.wrongWordRepository.create({
          user_id: userId,
          dictation_record_id: dictationWord.dictation_record_id,
          dictation_word_id: dictationWord.id,
          word: dictationWord.word,
          wrong_answer: dictationWord.user_answer,
          correct_answer: dictationWord.word,
          word_details: {
            us_phonetic: dictationWord.us_phonetic,
            uk_phonetic: dictationWord.uk_phonetic,
            translations: dictationWord.translations,
            sentences: dictationWord.sentences,
            synonyms: dictationWord.synonyms,
            phrases: dictationWord.phrases,
          },
          error_count: 1,
          review_status: 'pending',
        });
        await this.wrongWordRepository.save(wrongWord);
      }

      this.logger.log(`添加错题到错题本: ${dictationWord.word}`);
    } catch (error) {
      this.logger.error('添加错题失败:', error);
    }
  }

  /**
   * 更新听写记录统计信息
   * @param dictationId 听写记录ID
   */
  private async updateDictationStats(dictationId: number): Promise<void> {
    try {
      const stats = await this.dictationWordRepository
        .createQueryBuilder('dw')
        .select([
          'COUNT(*) as total',
          'SUM(CASE WHEN dw.status = :correct THEN 1 ELSE 0 END) as correct',
          'SUM(CASE WHEN dw.status = :wrong THEN 1 ELSE 0 END) as wrong',
        ])
        .where('dw.dictation_record_id = :dictationId', { dictationId })
        .setParameters({
          correct: DictationWordStatus.CORRECT,
          wrong: DictationWordStatus.WRONG,
        })
        .getRawOne();

      const correctWords = parseInt(stats.correct) || 0;
      const wrongWords = parseInt(stats.wrong) || 0;
      const totalWords = parseInt(stats.total) || 0;
      const accuracyRate =
        totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

      await this.dictationRecordRepository.update(dictationId, {
        correct_words: correctWords,
        wrong_words: wrongWords,
        accuracy_rate: Math.round(accuracyRate * 100) / 100, // 保留两位小数
      });
    } catch (error) {
      this.logger.error('更新听写统计失败:', error);
    }
  }
}
