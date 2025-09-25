/*
 * @Author: wanglx
 * @Date: 2025-09-24 16:07:53
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-24 19:23:23
 * @Description: 单词控制器
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { WordsService } from './words.service';
import { ResponseDto } from '../common/dto/response.dto';
import { ImportWordsDto, ImportResultDto, WordInfoResponseDto } from './dto';
import {
  CreateWordBookDto,
  WordBookListQueryDto,
  WordBookWordsQueryDto,
  SetRecommendedDto,
} from './dto/word-book.dto';
import { NewWordData } from './interfaces/word-data.interface';
import { replaceFrenchChars, validateAndFixJson } from './utils/text.utils';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('单词管理')
@Controller('words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Post('import')
  @ApiOperation({
    summary: '批量导入单词数据',
    description: `
      批量导入单词数据到数据库。
      
      数据格式要求：
      - 单词文本（word）
      - 翻译列表（translations）：包含翻译内容和词性
      - 短语列表（phrases）：包含短语和翻译
    `,
  })
  @ApiBearerAuth()
  @ApiBody({
    type: ImportWordsDto,
    description: '单词数据',
    examples: {
      example1: {
        summary: '示例数据',
        value: {
          words: [
            {
              word: 'pharmacy',
              translations: [
                {
                  translation: '药房；配药学，药剂学；制药业；一批备用药品',
                  type: 'n',
                },
              ],
              phrases: [
                {
                  phrase: 'college of pharmacy',
                  translation: '药学院；药剂学院',
                },
              ],
            },
          ],
          source: 'BEC_2',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '导入成功',
    type: ResponseDto<ImportResultDto>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async importWords(
    @Body(ValidationPipe) importWordsDto: ImportWordsDto,
  ): Promise<ResponseDto<ImportResultDto | null>> {
    try {
      if (!importWordsDto.words || importWordsDto.words.length === 0) {
        return new ResponseDto(400, null, '请提供要导入的单词数据');
      }

      const result = await this.wordsService.importWordsData(
        importWordsDto.words,
        importWordsDto.source,
        importWordsDto.book_id,
      );

      return new ResponseDto(200, result, '导入完成');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '导入失败',
      );
    }
  }

  @Get(':word')
  @ApiOperation({
    summary: '查询单词详细信息',
    description: `
      根据单词文本查询完整的单词信息，包括翻译和短语。
      如果单词在多个单词书中存在，将返回所有匹配的记录。
    `,
  })
  @ApiParam({
    name: 'word',
    description: '单词文本',
    example: 'pharmacy',
  })
  @ApiQuery({
    name: 'book_id',
    required: false,
    type: String,
    description: '单词书ID（可选，用于筛选特定单词书）',
    example: 'BEC_2',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              word: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  word: { type: 'string' },
                  us_phonetic: { type: 'string' },
                  uk_phonetic: { type: 'string' },
                  book_id: { type: 'string' },
                  word_rank: { type: 'number' },
                },
              },
              translations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    translation: { type: 'string' },
                    part_of_speech: { type: 'string' },
                  },
                },
              },
              phrases: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    phrase: { type: 'string' },
                    translation: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        errmsg: { type: 'string', example: '查询成功' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '单词未找到',
    type: ResponseDto<null>,
  })
  async getWordInfo(
    @Param('word') word: string,
    @Query('book_id') bookId?: string,
  ): Promise<ResponseDto<any>> {
    try {
      const results = await this.wordsService.getWordInfo(word, bookId);

      if (results.length === 0) {
        return new ResponseDto(404, null, '单词未找到');
      }

      return new ResponseDto(200, results, '查询成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }

  @Get('search/:keyword')
  @ApiOperation({
    summary: '搜索单词',
    description: `
      根据关键词搜索匹配的单词。
    `,
  })
  @ApiParam({
    name: 'keyword',
    description: '搜索关键词',
    example: 'pharm',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '返回结果数量限制，默认10',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '搜索成功',
    type: ResponseDto<WordInfoResponseDto[]>,
  })
  async searchWords(
    @Param('keyword') keyword: string,
    @Query('limit') limit: number = 10,
  ): Promise<ResponseDto<any>> {
    try {
      const results = await this.wordsService.searchWords(
        keyword,
        Math.min(limit, 50), // 限制最大返回50个结果
      );

      return new ResponseDto(200, results, '搜索成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '搜索失败',
      );
    }
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: '获取单词统计信息',
    description: `
      获取单词库的统计信息，包括总单词数、翻译数、短语数等。
    `,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            totalWords: { type: 'number', example: 100 },
            totalTranslations: { type: 'number', example: 150 },
            totalPhrases: { type: 'number', example: 80 },
            activeWords: { type: 'number', example: 95 },
          },
        },
        errmsg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getWordsStats(): Promise<ResponseDto<any>> {
    try {
      const stats = await this.wordsService.getWordsStats();
      return new ResponseDto(200, stats, '获取成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '获取统计信息失败',
      );
    }
  }

  @Post('import/json-file')
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '上传JSON文件批量导入单词',
    description: `
      上传JSON文件批量导入单词数据。
      
      支持的文件格式：
      - JSON文件 (.json)
      - 单个JSON对象或JSON数组
      
      文件限制：
      - 最大文件大小：50MB
      
      自动处理：
      - 法语字符替换
      - JSON格式验证和修复
      - 文本清理
    `,
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传的JSON文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JSON文件 (.json, 最大50MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '导入成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            success: { type: 'number', example: 50 },
            failed: { type: 'number', example: 0 },
            errors: { type: 'array', items: { type: 'string' } },
            fileInfo: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                size: { type: 'number' },
                totalWords: { type: 'number' },
              },
            },
          },
        },
        errmsg: { type: 'string', example: '文件导入成功' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async importJsonFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseDto<any>> {
    try {
      if (!file) {
        return new ResponseDto(400, null, '请上传JSON文件');
      }

      // 验证文件类型
      const allowedTypes = ['application/json', 'text/plain'];
      const allowedExtensions = ['.json'];
      const isValidType =
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.some((ext) =>
          file.originalname.toLowerCase().endsWith(ext),
        );

      if (!isValidType) {
        return new ResponseDto(400, null, '只支持 JSON 格式的文件 (.json)');
      }

      // 验证文件大小（最大50MB）
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return new ResponseDto(400, null, 'JSON文件大小不能超过50MB');
      }

      // 读取文件内容
      const fileContent = file.buffer.toString('utf-8');

      // 清理和验证JSON内容
      const cleanedContent = replaceFrenchChars(fileContent);
      const validatedContent = validateAndFixJson(cleanedContent);

      let jsonData: any;
      try {
        jsonData = JSON.parse(validatedContent);
      } catch (parseError) {
        return new ResponseDto(
          400,
          null,
          `JSON文件解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
      }

      // 处理不同的JSON结构
      let wordsArray: NewWordData[];
      if (Array.isArray(jsonData)) {
        wordsArray = jsonData;
      } else if (jsonData && typeof jsonData === 'object') {
        // 单个对象，封装成数组
        wordsArray = [jsonData];
      } else {
        return new ResponseDto(
          400,
          null,
          'JSON文件格式不正确，应为对象或对象数组',
        );
      }

      if (wordsArray.length === 0) {
        return new ResponseDto(400, null, 'JSON文件中没有找到有效的单词数据');
      }

      // 批量导入单词数据
      const result =
        await this.wordsService.importNewFormatWordsData(wordsArray);

      // 返回结果
      const responseData = {
        ...result,
        fileInfo: {
          filename: file.originalname,
          size: file.size,
          totalWords: wordsArray.length,
        },
      };

      return new ResponseDto(200, responseData, '文件导入成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '文件导入失败',
      );
    }
  }

  // ==================== 单词书管理API ====================

  @Post('books')
  @ApiOperation({
    summary: '创建或更新单词书',
    description: '创建新的单词书或更新现有单词书信息',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateWordBookDto })
  @ApiResponse({
    status: 200,
    description: '操作成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            book_id: { type: 'string' },
            book_name: { type: 'string' },
            total_words: { type: 'number' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        errmsg: { type: 'string', example: '操作成功' },
      },
    },
  })
  async createOrUpdateWordBook(
    @Body(ValidationPipe) createWordBookDto: CreateWordBookDto,
  ): Promise<ResponseDto<any>> {
    try {
      const wordBook = await this.wordsService.createOrUpdateWordBook({
        ...createWordBookDto,
        release_date: createWordBookDto.release_date
          ? new Date(createWordBookDto.release_date)
          : undefined,
      });

      return new ResponseDto(200, wordBook, '操作成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '操作失败',
      );
    }
  }

  @Get('books')
  @ApiOperation({
    summary: '获取单词书列表',
    description: '获取所有单词书列表，支持分类过滤',
  })
  @ApiQuery({ name: 'include_inactive', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              book_id: { type: 'string' },
              book_name: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              difficulty_level: { type: 'string' },
              total_words: { type: 'number' },
              is_active: { type: 'boolean' },
              is_recommended: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        errmsg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getWordBooks(
    @Query() query: WordBookListQueryDto,
  ): Promise<ResponseDto<any>> {
    try {
      let wordBooks;

      if (query.category) {
        wordBooks = await this.wordsService.getWordBooksByCategory(
          query.category,
        );
      } else {
        wordBooks = await this.wordsService.getAllWordBooks(
          query.include_inactive,
        );
      }

      return new ResponseDto(200, wordBooks, '获取成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '获取失败',
      );
    }
  }

  @Get('books/recommended')
  @ApiOperation({
    summary: '获取推荐单词书列表',
    description: '获取推荐的单词书列表',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: ResponseDto,
  })
  async getRecommendedWordBooks(): Promise<ResponseDto<any>> {
    try {
      const wordBooks = await this.wordsService.getRecommendedWordBooks();
      return new ResponseDto(200, wordBooks, '获取成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '获取失败',
      );
    }
  }

  @Get('books/:bookId/words')
  @ApiOperation({
    summary: '获取单词书的单词列表',
    description: '根据单词书ID获取该书的所有单词，支持分页',
  })
  @ApiParam({
    name: 'bookId',
    description: '单词书ID',
    example: 'BEC_2',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            words: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  word: { type: 'object' },
                  translations: { type: 'array' },
                  phrases: { type: 'array' },
                  sentences: { type: 'array' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        errmsg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getWordsByBookId(
    @Param('bookId') bookId: string,
    @Query() query: WordBookWordsQueryDto,
  ): Promise<ResponseDto<any>> {
    try {
      const result = await this.wordsService.getWordsByBookId(
        bookId,
        query.page,
        query.limit,
      );

      return new ResponseDto(200, result, '获取成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '获取失败',
      );
    }
  }

  @Get('books/:bookId/stats')
  @ApiOperation({
    summary: '获取单词书的详细统计信息',
    description: '获取指定单词书的详细统计信息，包括单词数、翻译数、短语数等',
  })
  @ApiParam({
    name: 'bookId',
    description: '单词书ID',
    example: 'BEC_2',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            book: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                book_id: { type: 'string' },
                book_name: { type: 'string' },
                total_words: { type: 'number' },
              },
            },
            stats: {
              type: 'object',
              properties: {
                totalWords: { type: 'number' },
                totalTranslations: { type: 'number' },
                totalPhrases: { type: 'number' },
                totalSentences: { type: 'number' },
                totalSynonyms: { type: 'number' },
                totalRelatedWords: { type: 'number' },
              },
            },
          },
        },
        errmsg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getWordBookDetailStats(
    @Param('bookId') bookId: string,
  ): Promise<ResponseDto<any>> {
    try {
      const result = await this.wordsService.getWordBookDetailStats(bookId);

      if (!result) {
        return new ResponseDto(404, null, '单词书未找到');
      }

      return new ResponseDto(200, result, '获取成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '获取失败',
      );
    }
  }

  @Post('books/:bookId/update-stats')
  @ApiOperation({
    summary: '更新单词书的统计信息',
    description: '手动触发更新指定单词书的统计信息',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'bookId',
    description: '单词书ID',
    example: 'BEC_2',
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: ResponseDto,
  })
  async updateWordBookStats(
    @Param('bookId') bookId: string,
  ): Promise<ResponseDto<any>> {
    try {
      await this.wordsService.updateWordBookStats(bookId);
      return new ResponseDto(200, null, '统计信息更新成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '更新失败',
      );
    }
  }

  @Post('books/:bookId/set-recommended')
  @ApiOperation({
    summary: '设置单词书推荐状态',
    description: '设置或取消单词书的推荐状态',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'bookId',
    description: '单词书ID',
    example: 'BEC_2',
  })
  @ApiBody({ type: SetRecommendedDto })
  @ApiResponse({
    status: 200,
    description: '设置成功',
    type: ResponseDto,
  })
  async setWordBookRecommended(
    @Param('bookId') bookId: string,
    @Body(ValidationPipe) setRecommendedDto: SetRecommendedDto,
  ): Promise<ResponseDto<any>> {
    try {
      await this.wordsService.setWordBookRecommended(
        bookId,
        setRecommendedDto.is_recommended,
      );

      const action = setRecommendedDto.is_recommended
        ? '设置为推荐'
        : '取消推荐';
      return new ResponseDto(200, null, `${action}成功`);
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '设置失败',
      );
    }
  }
}
