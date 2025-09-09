import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class DoubaoService {
  private readonly logger = new Logger(DoubaoService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DOUBAO_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('DOUBAO_BASE_URL') ||
      'https://ark.cn-beijing.volces.com/api/v3';
  }

  async recognizeImageText(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    try {
      // 将图片转换为base64
      const base64Image = imageBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${base64Image}`;

      const payload = {
        model: 'doubao-seed-1-6-vision-250815', // 豆包视觉模型
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                // text: '请识别图片中的所有英文单词和中文文字，并以纯文本形式返回，不要添加任何解释或格式。',
                text: `请识别图片中的所有，英文单词、中文、音标等信息，以JSON格式返回：
   - word: 单词原形
   - phonetic: 音标（英式发音）
   - translation: 中文翻译
   - partOfSpeech: 词性（如：名词、动词、形容词等）
                ，没有的信息默认填充为空，不要添加任何解释或格式。`,
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
        max_tokens: 3200,
        temperature: 0.1,
        thinking: {
          type: 'disabled',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 600000,
        },
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('豆包API返回数据格式错误');
    } catch (error) {
      this.logger.error(
        '豆包图片识别失败:',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error(
        `豆包图片识别失败: ${error instanceof Error ? error.message : String(error)}`,
      );
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
   - examples: 例句数组（如果有）

返回格式：
{
  "words": [
    {
      "word": "example",
      "phonetic": "/ɪɡˈzɑːmpl/",
      "translation": "例子",
      "partOfSpeech": "名词",
      "examples": ["This is an example sentence."]
    }
  ]
}

只返回JSON，不要添加其他解释。`;

      const payload = {
        model: 'doubao-seed-1-6-250615',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3200,
        // max_completion_tokens
        temperature: 0.1,
        thinking: {
          type: 'disabled',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 600000,
        },
      );
      console.log('[ processTextWithAIresponse ] >', response);
      if (response.data.choices && response.data.choices.length > 0) {
        console.log(
          '[ response.data.choices ] >',
          JSON.stringify(response.data.choices),
        );
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('豆包API返回数据格式错误');
    } catch (error) {
      this.logger.error(
        '豆包文本处理失败:',
        error instanceof Error ? error.message : String(error),
      );
      throw new Error(
        `豆包文本处理失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
