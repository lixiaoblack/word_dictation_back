import { Injectable, Logger } from '@nestjs/common';
import { DoubaoService } from '../ai-providers/doubao.service';
import { DeepSeekService } from '../ai-providers/deepseek.service';
import { TranslationService } from '../translation/translation.service';
import { RecognitionResult, WordInfo } from '../types';

@Injectable()
export class ImageRecognitionService {
  private readonly logger = new Logger(ImageRecognitionService.name);

  constructor(
    private readonly doubaoService: DoubaoService,
    private readonly deepseekService: DeepSeekService,
    private readonly translationService: TranslationService,
  ) {}

  async recognizeText(
    file: Express.Multer.File,
    provider: 'doubao' | 'deepseek' = 'doubao',
  ): Promise<RecognitionResult> {
    try {
      this.logger.log(`开始使用 ${provider} 识别图片文字`);

      let recognizedText: string;

      // 根据选择的提供商进行图片识别
      if (provider === 'doubao') {
        recognizedText = await this.doubaoService.recognizeImageText(
          file.buffer,
          file.mimetype,
        );
      } else {
        recognizedText = await this.deepseekService.recognizeImageText(
          file.buffer,
          file.mimetype,
        );
      }

      this.logger.log(`图片识别完成，识别到文本: ${recognizedText}`);

      // 处理识别到的文本
      return await this.processText(recognizedText, provider);
    } catch (error) {
      this.logger.error('图片识别失败:', error.message);
      throw error;
    }
  }

  async processText(
    text: string,
    provider: 'doubao' | 'deepseek' = 'doubao',
  ): Promise<RecognitionResult> {
    try {
      this.logger.log(`开始处理文本: ${text}`);

      // 首先尝试用AI分析文本
      let aiAnalysisResult: WordInfo[] = [];

      try {
        const aiResponse =
          provider === 'doubao'
            ? await this.doubaoService.processTextWithAI(text)
            : await this.deepseekService.processTextWithAI(text);

        // 尝试解析AI返回的JSON
        const parsedResult = this.parseAIResponse(aiResponse);
        if (
          parsedResult &&
          parsedResult.words &&
          Array.isArray(parsedResult.words)
        ) {
          aiAnalysisResult = parsedResult.words;
          this.logger.log(`AI分析成功，找到 ${aiAnalysisResult.length} 个单词`);
        }
      } catch (aiError) {
        this.logger.warn('AI分析失败，使用传统方法处理:', aiError.message);
      }

      // 如果AI分析失败或结果为空，使用传统方法
      if (aiAnalysisResult.length === 0) {
        aiAnalysisResult = await this.fallbackProcessing(text);
      }

      // 确保所有单词都有完整的信息
      const processedWords = await this.enhanceWordInfo(aiAnalysisResult);

      return {
        originalText: text,
        words: processedWords,
        provider,
        confidence: this.calculateConfidence(processedWords),
      };
    } catch (error) {
      this.logger.error('文本处理失败:', error.message);
      throw error;
    }
  }

  private parseAIResponse(response: string): { words: WordInfo[] } | null {
    try {
      // 清理响应文本，移除可能的markdown格式
      let cleanResponse = response.trim();

      // 移除可能的markdown代码块标记
      cleanResponse = cleanResponse.replace(/```json\s*|\s*```/g, '');
      cleanResponse = cleanResponse.replace(/```\s*|\s*```/g, '');

      // 尝试找到JSON部分
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanResponse);
      return parsed;
    } catch (error) {
      this.logger.warn('解析AI响应失败:', error.message);
      return null;
    }
  }

  private async fallbackProcessing(text: string): Promise<WordInfo[]> {
    try {
      // 提取英文单词
      const words = this.translationService.extractWordsFromText(text);

      if (words.length === 0) {
        return [];
      }

      // 批量翻译单词
      const translatedWords =
        await this.translationService.batchTranslateWords(words);

      return translatedWords;
    } catch (error) {
      this.logger.error('fallback处理失败:', error.message);
      return [];
    }
  }

  private async enhanceWordInfo(words: WordInfo[]): Promise<WordInfo[]> {
    const enhancedWords: WordInfo[] = [];

    for (const word of words) {
      try {
        let enhancedWord = { ...word };

        // 如果缺少音标或翻译，尝试补充
        if (
          !enhancedWord.phonetic ||
          !enhancedWord.translation ||
          enhancedWord.translation === enhancedWord.word
        ) {
          const translationResult = await this.translationService.translateWord(
            enhancedWord.word,
          );

          enhancedWord = {
            ...enhancedWord,
            phonetic: enhancedWord.phonetic || translationResult.phonetic,
            translation:
              enhancedWord.translation === enhancedWord.word
                ? translationResult.translation || enhancedWord.word
                : enhancedWord.translation,
            definitions:
              enhancedWord.definitions && enhancedWord.definitions.length > 0
                ? enhancedWord.definitions
                : translationResult.definitions || [],
          };
        }

        // 确保必要字段有默认值
        enhancedWord.partOfSpeech = enhancedWord.partOfSpeech || '词汇';
        enhancedWord.definitions = enhancedWord.definitions || [];
        enhancedWord.examples = enhancedWord.examples || [];

        enhancedWords.push(enhancedWord);
      } catch (error) {
        this.logger.warn(`增强单词 "${word.word}" 信息失败:`, error.message);
        // 添加基本信息
        enhancedWords.push({
          ...word,
          partOfSpeech: word.partOfSpeech || '词汇',
          definitions: word.definitions || [],
          examples: word.examples || [],
        });
      }
    }

    return enhancedWords;
  }

  private calculateConfidence(words: WordInfo[]): number {
    if (words.length === 0) return 0;

    let totalScore = 0;
    let scoredWords = 0;

    for (const word of words) {
      let wordScore = 0;

      // 有音标加分
      if (word.phonetic) wordScore += 25;

      // 有翻译且不同于原词加分
      if (word.translation && word.translation !== word.word) wordScore += 25;

      // 有词性信息加分
      if (word.partOfSpeech) wordScore += 25;

      // 有详细释义加分
      if (word.definitions && word.definitions.length > 0) wordScore += 25;

      totalScore += wordScore;
      scoredWords++;
    }

    return scoredWords > 0 ? Math.round(totalScore / scoredWords) : 0;
  }
}
