/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: 文本转语音核心服务
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { Readable } from 'stream';
import { createHash } from 'crypto';
import {
  TtsOptions,
  AudioResult,
  VoiceConfig,
  VOICE_PRESETS,
  COMMON_VOICES,
} from './interfaces/voice.interface';
import {
  TtsAudioRecord,
  AudioType,
  AudioStatus,
} from './entities/tts-audio.entity';
import { OssService } from '../common/services/oss.service';
import {
  StorageBatchTtsRequestDto,
  StorageBatchTtsResponseDto,
  TtsAudioInfoDto,
  TtsQueryDto,
  TtsRecordDetailDto,
} from './dto/batch-tts.dto';

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);
  private readonly maxTextLength = 1000;
  private readonly defaultFormat =
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
  private readonly voiceFolder = 'voice'; // OSS存储文件夹

  constructor(
    @InjectRepository(TtsAudioRecord)
    private readonly ttsAudioRepository: Repository<TtsAudioRecord>,
    private readonly ossService: OssService,
  ) {}

  /**
   * 文本转语音
   * @param text 要转换的文本
   * @param options TTS选项
   */
  async textToSpeech(
    text: string,
    options: Partial<TtsOptions> = {},
  ): Promise<AudioResult> {
    try {
      // 验证文本长度
      if (text.length > this.maxTextLength) {
        throw new HttpException(
          `文本长度不能超过${this.maxTextLength}字符`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const {
        voice = VOICE_PRESETS.EN_US_FEMALE,
        rate = 1.0,
        pitch = 0,
        volume = 100,
      } = options;

      this.logger.log(
        `开始TTS转换: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" 使用语音: ${voice}`,
      );

      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, this.defaultFormat);

      // 生成SSML
      const ssml = this.generateSSML(text, voice, rate, pitch, volume);

      const streams = tts.toStream(text, {
        rate: rate === 1.0 ? '1.0' : `${rate}`,
        pitch: pitch === 0 ? '0Hz' : `${pitch > 0 ? '+' : ''}${pitch}Hz`,
        volume: volume === 100 ? '100' : `${volume}`,
      });
      const readable = streams.audioStream;
      const chunks: Buffer[] = [];

      const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
        readable.on('data', (chunk) => chunks.push(chunk));
        readable.on('end', () => resolve(Buffer.concat(chunks)));
        readable.on('error', (error) => {
          this.logger.error('TTS流处理错误:', error);
          reject(error);
        });
      });

      this.logger.log(`TTS转换完成，音频大小: ${audioBuffer.length} 字节`);

      return {
        buffer: audioBuffer,
        format: 'audio/mpeg',
        size: audioBuffer.length,
        duration: this.estimateDuration(text, rate),
      };
    } catch (error) {
      this.logger.error('TTS转换失败:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        '语音合成失败，请稍后重试',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 单词发音
   * @param word 单词
   * @param voice 语音类型
   * @param rate 语速
   */
  async wordPronunciation(
    word: string,
    voice: string = VOICE_PRESETS.EN_US_FEMALE,
    rate: number = 1.0,
  ): Promise<AudioResult> {
    return this.textToSpeech(word, { voice, rate });
  }

  /**
   * 批量文本转语音
   * @param texts 文本列表
   * @param options TTS选项
   * @param interval 间隔时间（毫秒）
   */
  async batchTextToSpeech(
    texts: string[],
    options: Partial<TtsOptions> = {},
    interval: number = 1000,
  ): Promise<AudioResult[]> {
    try {
      const results: AudioResult[] = [];

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        this.logger.log(`批量TTS处理: ${i + 1}/${texts.length} - "${text}"`);

        const result = await this.textToSpeech(text, options);
        results.push(result);

        // 添加间隔（除了最后一个）
        if (i < texts.length - 1 && interval > 0) {
          await this.delay(interval);
        }
      }

      this.logger.log(`批量TTS完成，共处理 ${texts.length} 个文本`);
      return results;
    } catch (error) {
      this.logger.error('批量TTS转换失败:', error);
      throw new HttpException(
        '批量语音合成失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 合并音频缓冲区
   * @param audioResults 音频结果列表
   * @param silenceInterval 静音间隔（毫秒）
   */
  async mergeAudioBuffers(
    audioResults: AudioResult[],
    silenceInterval: number = 1000,
  ): Promise<AudioResult> {
    try {
      const segments: Buffer[] = [];
      let totalSize = 0;
      let totalDuration = 0;

      for (let i = 0; i < audioResults.length; i++) {
        const result = audioResults[i];
        segments.push(result.buffer);
        totalSize += result.size;
        totalDuration += result.duration || 0;

        // 添加静音间隔（除了最后一个）
        if (i < audioResults.length - 1 && silenceInterval > 0) {
          const silence = this.generateSilence(silenceInterval);
          segments.push(silence);
          totalSize += silence.length;
          totalDuration += silenceInterval / 1000;
        }
      }

      const mergedBuffer = Buffer.concat(segments);

      return {
        buffer: mergedBuffer,
        format: 'audio/mpeg',
        size: totalSize,
        duration: totalDuration,
      };
    } catch (error) {
      this.logger.error('音频合并失败:', error);
      throw new HttpException('音频合并失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取可用语音列表
   */
  async getVoices(): Promise<VoiceConfig[]> {
    try {
      this.logger.log('获取语音列表');

      // 返回常用语音配置
      // 注意：msedge-tts 2.0+ 版本的getVoices方法可能有变化
      // 这里先返回预定义的常用语音
      return COMMON_VOICES;
    } catch (error) {
      this.logger.error('获取语音列表失败:', error);
      // 降级返回预定义语音
      return COMMON_VOICES;
    }
  }

  /**
   * 获取所有可用语音（完整列表）
   */
  async getAllVoices(): Promise<any[]> {
    try {
      const tts = new MsEdgeTTS();
      // 注意：根据msedge-tts版本，这个方法可能需要调整
      const voices = await tts.getVoices();
      return voices;
    } catch (error) {
      this.logger.warn('获取完整语音列表失败，返回预定义列表:', error);
      return COMMON_VOICES;
    }
  }

  /**
   * 验证语音是否可用
   * @param voice 语音名称
   */
  async validateVoice(voice: string): Promise<boolean> {
    try {
      const voices = await this.getVoices();
      return voices.some((v) => v.name === voice);
    } catch (error) {
      this.logger.warn(`验证语音失败: ${voice}`, error);
      // 检查是否在预设语音中
      return Object.values(VOICE_PRESETS).includes(voice);
    }
  }

  /**
   * 生成SSML标记
   */
  private generateSSML(
    text: string,
    voice: string,
    rate: number,
    pitch: number,
    volume: number,
  ): string {
    // 处理语速
    const rateStr =
      rate === 1.0
        ? 'medium'
        : rate < 1.0
          ? `${Math.round((rate - 1) * 100)}%`
          : `+${Math.round((rate - 1) * 100)}%`;

    // 处理音调
    const pitchStr =
      pitch === 0 ? 'medium' : `${pitch > 0 ? '+' : ''}${pitch}%`;

    // 处理音量
    const volumeStr = volume === 100 ? 'default' : `${volume}%`;

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${rateStr}" pitch="${pitchStr}" volume="${volumeStr}">
            ${this.escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
  }

  /**
   * 转义XML特殊字符
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * 生成静音音频
   * @param duration 静音时长（毫秒）
   */
  private generateSilence(duration: number): Buffer {
    // 生成简单的静音MP3头部
    // 这是一个简化实现，实际使用中可能需要更复杂的静音生成
    const samples = Math.floor(duration * 48); // 48kHz
    const silenceBuffer = Buffer.alloc(samples, 0);
    return silenceBuffer;
  }

  /**
   * 估算音频时长
   * @param text 文本
   * @param rate 语速
   */
  private estimateDuration(text: string, rate: number): number {
    // 简单估算：平均每分钟200个英文单词，考虑语速
    const words = text.split(/\s+/).length;
    const baseWPM = 200; // 每分钟单词数
    const adjustedWPM = baseWPM * rate;
    return (words / adjustedWPM) * 60;
  }

  /**
   * 延时函数
   * @param ms 毫秒
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 生成内容哈希值
   * @param text 文本
   * @param voice 语音
   * @param rate 语速
   * @param pitch 音调
   * @param volume 音量
   */
  private generateContentHash(
    text: string,
    voice: string,
    rate: number,
    pitch: number,
    volume: number,
  ): string {
    const content = `${text}|${voice}|${rate}|${pitch}|${volume}`;
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * 生成安全的文件名
   * @param text 文本内容
   * @param contentHash 内容哈希
   */
  private generateFileName(text: string, contentHash: string): string {
    // 取哈希前8位作为唯一标识
    const hashPrefix = contentHash.substring(0, 8);

    // 清理文本，只保留字母数字和常见符号
    const cleanText = text
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s\-_]/g, '')
      .trim()
      .substring(0, 30); // 限制长度

    // 如果清理后的文本为空，使用默认名称
    const safeName = cleanText || 'audio';

    return `${hashPrefix}_${safeName}.mp3`;
  }

  /**
   * 文本转语音并存储到OSS
   * @param text 要转换的文本
   * @param options TTS选项
   * @param userId 用户ID
   * @param audioType 音频类型
   */
  async textToSpeechWithStorage(
    text: string,
    options: Partial<TtsOptions> = {},
    userId?: string,
    audioType: AudioType = AudioType.TEXT,
  ): Promise<TtsAudioInfoDto> {
    const {
      voice = VOICE_PRESETS.EN_US_FEMALE,
      rate = 1.0,
      pitch = 0,
      volume = 100,
    } = options;

    // 生成内容哈希
    const contentHash = this.generateContentHash(
      text,
      voice,
      rate,
      pitch,
      volume,
    );

    this.logger.log(
      `开始TTS处理: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" Hash: ${contentHash}`,
    );

    // 检查是否已存在
    let existingRecord = await this.ttsAudioRepository.findOne({
      where: { content_hash: contentHash },
    });

    if (existingRecord && existingRecord.status === AudioStatus.COMPLETED) {
      this.logger.log(`音频已存在，直接返回: ${existingRecord.file_url}`);

      // 更新使用统计
      await this.updateUsageStats(existingRecord.id);

      return {
        id: existingRecord.id,
        text: existingRecord.text,
        voice: existingRecord.voice,
        type: existingRecord.type,
        file_url: existingRecord.file_url,
        file_size: existingRecord.file_size,
        duration: existingRecord.duration,
        created_at: existingRecord.created_at,
        is_new: false,
      };
    }

    // 创建或更新数据库记录
    if (!existingRecord) {
      existingRecord = this.ttsAudioRepository.create({
        content_hash: contentHash,
        text,
        voice,
        type: audioType,
        rate,
        pitch,
        volume,
        status: AudioStatus.GENERATING,
        created_by: userId,
      });
      await this.ttsAudioRepository.save(existingRecord);
    } else {
      // 重置状态为生成中
      existingRecord.status = AudioStatus.GENERATING;
      existingRecord.error_message = null;
      await this.ttsAudioRepository.save(existingRecord);
    }

    try {
      // 生成音频
      const audioResult = await this.textToSpeech(text, options);

      // 生成文件名
      const fileName = this.generateFileName(text, contentHash);

      // 上传到OSS
      const fileUrl = await this.ossService.uploadBase64(
        audioResult.buffer.toString('base64'),
        fileName,
        this.voiceFolder,
      );

      this.logger.log(`音频上传成功: ${fileUrl}`);

      // 更新数据库记录
      existingRecord.status = AudioStatus.COMPLETED;
      existingRecord.file_url = fileUrl;
      existingRecord.file_path = `${this.voiceFolder}/${fileName}`;
      existingRecord.file_name = fileName;
      existingRecord.file_size = audioResult.size;
      existingRecord.duration = audioResult.duration || 0;
      existingRecord.format = audioResult.format;
      existingRecord.usage_count = 1;
      existingRecord.last_used_at = new Date();

      await this.ttsAudioRepository.save(existingRecord);

      return {
        id: existingRecord.id,
        text: existingRecord.text,
        voice: existingRecord.voice,
        type: existingRecord.type,
        file_url: existingRecord.file_url,
        file_size: existingRecord.file_size,
        duration: existingRecord.duration || 0,
        created_at: existingRecord.created_at,
        is_new: true,
      };
    } catch (error) {
      this.logger.error(`TTS生成失败: ${error.message}`, error);

      // 更新失败状态
      existingRecord.status = AudioStatus.FAILED;
      existingRecord.error_message = error.message;
      await this.ttsAudioRepository.save(existingRecord);

      throw error;
    }
  }

  /**
   * 智能检测文本语言并选择合适的语音
   * @param text 文本
   * @param userVoice 用户指定的语音（可选）
   */
  private detectLanguageAndVoice(text: string, userVoice?: string): string {
    // 如果用户指定了语音，直接使用
    if (userVoice && userVoice !== 'auto') {
      return userVoice;
    }

    // 检测是否包含中文字符
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);

    // 检测是否主要是英文（字母、数字、常见标点）
    const hasEnglish = /^[a-zA-Z0-9\s.,!?;:"'-]+$/.test(text.trim());

    if (hasChinese) {
      // 包含中文，使用中文语音
      return VOICE_PRESETS.ZH_CN_FEMALE; // 假设有中文女声
    } else if (hasEnglish) {
      // 纯英文，使用英文语音
      return VOICE_PRESETS.EN_US_FEMALE;
    } else {
      // 默认使用英文语音
      return VOICE_PRESETS.EN_US_FEMALE;
    }
  }

  /**
   * 获取文本对应的音频URL
   * @param text 文本内容
   * @param options TTS选项
   * @param userId 用户ID
   * @param forceRegenerate 是否强制重新生成
   */
  async getAudioUrl(
    text: string,
    options: Partial<TtsOptions> = {},
    userId?: string,
    forceRegenerate: boolean = false,
  ): Promise<{
    file_url: string;
    is_new: boolean;
    voice_used: string;
    file_size: number;
    duration: number;
  }> {
    // 智能选择语音
    const detectedVoice = this.detectLanguageAndVoice(text, options.voice);

    const finalOptions = {
      ...options,
      voice: detectedVoice,
    };

    this.logger.log(
      `获取音频URL: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}" 使用语音: ${detectedVoice}`,
    );

    // 生成内容哈希
    const contentHash = this.generateContentHash(
      text,
      finalOptions.voice || VOICE_PRESETS.EN_US_FEMALE,
      finalOptions.rate || 1.0,
      finalOptions.pitch || 0,
      finalOptions.volume || 100,
    );

    // 如果强制重新生成，先删除已存在的记录
    if (forceRegenerate) {
      await this.ttsAudioRepository.delete({ content_hash: contentHash });
      this.logger.log(`强制重新生成，已删除现有记录: ${contentHash}`);
    }

    // 调用存储方法生成或获取音频
    const result = await this.textToSpeechWithStorage(
      text,
      finalOptions,
      userId,
      AudioType.WORD, // 单词/文本类型
    );

    return {
      file_url: result.file_url!,
      is_new: result.is_new,
      voice_used: detectedVoice,
      file_size: result.file_size || 0,
      duration: result.duration || 0,
    };
  }

  /**
   * 批量文本转语音并存储
   * @param batchRequest 批量请求
   * @param userId 用户ID
   */
  async batchTextToSpeechWithStorage(
    batchRequest: StorageBatchTtsRequestDto,
    userId?: string,
  ): Promise<StorageBatchTtsResponseDto> {
    const startTime = Date.now();
    const results: TtsAudioInfoDto[] = [];
    const failedTexts: string[] = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    this.logger.log(`开始批量TTS处理: ${batchRequest.texts.length} 个文本`);

    for (let i = 0; i < batchRequest.texts.length; i++) {
      const text = batchRequest.texts[i];

      try {
        this.logger.log(
          `处理 ${i + 1}/${batchRequest.texts.length}: "${text}"`,
        );

        // 检查是否强制重新生成
        if (batchRequest.force_regenerate) {
          // 删除已存在的记录
          const contentHash = this.generateContentHash(
            text,
            batchRequest.voice || VOICE_PRESETS.EN_US_FEMALE,
            batchRequest.rate || 1.0,
            batchRequest.pitch || 0,
            batchRequest.volume || 100,
          );

          await this.ttsAudioRepository.delete({ content_hash: contentHash });
        }

        const result = await this.textToSpeechWithStorage(
          text,
          {
            voice: batchRequest.voice,
            rate: batchRequest.rate,
            pitch: batchRequest.pitch,
            volume: batchRequest.volume,
          },
          userId,
          batchRequest.type || AudioType.BATCH,
        );

        results.push(result);

        if (result.is_new) {
          successCount++;
        } else {
          skippedCount++;
        }

        // 添加间隔避免频率限制
        if (i < batchRequest.texts.length - 1) {
          await this.delay(500); // 500ms间隔
        }
      } catch (error) {
        this.logger.error(`文本处理失败: "${text}" - ${error.message}`);
        failedTexts.push(text);
        failureCount++;
      }
    }

    const totalTime = Date.now() - startTime;

    this.logger.log(
      `批量TTS完成: 成功${successCount}, 跳过${skippedCount}, 失败${failureCount}, 耗时${totalTime}ms`,
    );

    return {
      success_count: successCount,
      failure_count: failureCount,
      skipped_count: skippedCount,
      total_time: totalTime,
      audio_list: results,
      failed_texts: failedTexts,
      storage_folder: this.voiceFolder,
    };
  }

  /**
   * 查询TTS音频记录
   * @param query 查询条件
   */
  async queryTtsRecords(query: TtsQueryDto): Promise<{
    records: TtsRecordDetailDto[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const { keyword, voice, type, page = 1, page_size = 20 } = query;

    const queryBuilder = this.ttsAudioRepository.createQueryBuilder('audio');

    // 只查询成功生成的记录
    queryBuilder.where('audio.status = :status', {
      status: AudioStatus.COMPLETED,
    });

    if (keyword) {
      queryBuilder.andWhere('audio.text LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (voice) {
      queryBuilder.andWhere('audio.voice = :voice', { voice });
    }

    if (type) {
      queryBuilder.andWhere('audio.type = :type', { type });
    }

    // 分页
    const offset = (page - 1) * page_size;
    queryBuilder
      .orderBy('audio.created_at', 'DESC')
      .skip(offset)
      .take(page_size);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      records: records.map((record) => ({
        id: record.id,
        content_hash: record.content_hash,
        text: record.text,
        voice: record.voice,
        type: record.type,
        rate: record.rate,
        pitch: record.pitch,
        volume: record.volume,
        file_url: record.file_url,
        file_path: record.file_path,
        file_name: record.file_name,
        file_size: record.file_size,
        duration: record.duration || 0,
        format: record.format,
        usage_count: record.usage_count,
        created_at: record.created_at,
        last_used_at: record.last_used_at || new Date(),
      })),
      total,
      page,
      page_size,
    };
  }

  /**
   * 根据ID获取TTS音频记录
   * @param id 记录ID
   */
  async getTtsRecordById(id: number): Promise<TtsRecordDetailDto | null> {
    const record = await this.ttsAudioRepository.findOne({ where: { id } });

    if (!record) {
      return null;
    }

    // 更新使用统计
    if (record.status === AudioStatus.COMPLETED) {
      await this.updateUsageStats(id);
    }

    return {
      id: record.id,
      content_hash: record.content_hash,
      text: record.text,
      voice: record.voice,
      type: record.type,
      rate: record.rate,
      pitch: record.pitch,
      volume: record.volume,
      file_url: record.file_url,
      file_path: record.file_path,
      file_name: record.file_name,
      file_size: record.file_size,
      duration: record.duration || 0,
      format: record.format,
      usage_count: record.usage_count,
      created_at: record.created_at,
      last_used_at: record.last_used_at || new Date(),
    };
  }

  /**
   * 删除TTS音频记录
   * @param id 记录ID
   */
  async deleteTtsRecord(id: number): Promise<boolean> {
    const record = await this.ttsAudioRepository.findOne({ where: { id } });

    if (!record) {
      return false;
    }

    // TODO: 这里可以考虑同时删除OSS文件
    // await this.ossService.deleteFile(record.file_path);

    await this.ttsAudioRepository.remove(record);

    this.logger.log(`TTS记录已删除: ID=${id}`);
    return true;
  }

  /**
   * 获取TTS统计信息
   */
  async getTtsStatistics(): Promise<{
    total_records: number;
    total_file_size: number;
    total_duration: number;
    voice_distribution: Array<{ voice: string; count: number }>;
    type_distribution: Array<{ type: AudioType; count: number }>;
  }> {
    const queryBuilder = this.ttsAudioRepository.createQueryBuilder('audio');

    // 总记录数
    const totalRecords = await queryBuilder
      .where('audio.status = :status', { status: AudioStatus.COMPLETED })
      .getCount();

    // 总文件大小和时长
    const sizeAndDurationResult = await queryBuilder
      .select('SUM(audio.file_size)', 'totalSize')
      .addSelect('SUM(audio.duration)', 'totalDuration')
      .where('audio.status = :status', { status: AudioStatus.COMPLETED })
      .getRawOne();

    // 语音分布
    const voiceDistribution = await queryBuilder
      .select('audio.voice', 'voice')
      .addSelect('COUNT(*)', 'count')
      .where('audio.status = :status', { status: AudioStatus.COMPLETED })
      .groupBy('audio.voice')
      .orderBy('count', 'DESC')
      .getRawMany();

    // 类型分布
    const typeDistribution = await queryBuilder
      .select('audio.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('audio.status = :status', { status: AudioStatus.COMPLETED })
      .groupBy('audio.type')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total_records: totalRecords,
      total_file_size: parseInt(sizeAndDurationResult?.totalSize || '0'),
      total_duration: parseFloat(sizeAndDurationResult?.totalDuration || '0'),
      voice_distribution: voiceDistribution.map((item) => ({
        voice: item.voice,
        count: parseInt(item.count),
      })),
      type_distribution: typeDistribution.map((item) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 更新使用统计
   * @param recordId 记录ID
   */
  private async updateUsageStats(recordId: number): Promise<void> {
    try {
      await this.ttsAudioRepository
        .createQueryBuilder()
        .update(TtsAudioRecord)
        .set({
          usage_count: () => 'usage_count + 1',
          last_used_at: new Date(),
        })
        .where('id = :id', { id: recordId })
        .execute();
    } catch (error) {
      this.logger.warn(`更新使用统计失败: ID=${recordId}`, error);
    }
  }
}
