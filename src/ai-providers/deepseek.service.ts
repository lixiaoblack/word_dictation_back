import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DeepSeekService {
  private readonly logger = new Logger(DeepSeekService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ||
      'https://api.deepseek.com';
  }

  async recognizeImageText(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      // DeepSeek目前主要是文本模型，这里我们可以结合OCR库或者使用其他视觉API
      // 为了演示，我们先返回一个模拟的实现
      // 实际使用中，你可能需要先用其他OCR服务提取文字，然后用DeepSeek处理

      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      const payload = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别图片中的所有英文单词和中文文字，并以纯文本形式返回，不要添加任何解释或格式。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('DeepSeek API返回数据格式错误');
    } catch (error) {
      this.logger.error('DeepSeek图片识别失败:', error.message);
      // 如果DeepSeek不支持图片，我们可以fallback到文本处理
      throw new Error(`DeepSeek图片识别失败: ${error.message}`);
    }
  }

  async processTextWithAI(text: string): Promise<string> {
    try {
      const prompt = `
请分析以下文本中的英文单词，为每个单词提供详细信息，以JSON格式返回：

文本：${text}

要求：
1. 识别所有英文单词（忽略中文）
2. 为每个单词提供：
   - word: 单词原形
   - phonetic: 音标（英式发音）
   - translation: 中文翻译
   - partOfSpeech: 词性（如：名词、动词、形容词等）
   - definitions: 详细释义数组
   - examples: 例句数组（如果有）

返回格式：
{
  "words": [
    {
      "word": "example",
      "phonetic": "/ɪɡˈzɑːmpl/",
      "translation": "例子",
      "partOfSpeech": "名词",
      "definitions": ["用来说明或证明某事的事物"],
      "examples": ["This is an example sentence."]
    }
  ]
}

只返回JSON，不要添加其他解释。`;

      const payload = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
        stream: false,
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('DeepSeek API返回数据格式错误');
    } catch (error) {
      this.logger.error('DeepSeek文本处理失败:', error.message);
      throw new Error(`DeepSeek文本处理失败: ${error.message}`);
    }
  }
}
