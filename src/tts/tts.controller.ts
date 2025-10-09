/*
 * @Author: wanglx
 * @Date: 2025-09-25 20:00:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-25 20:00:00
 * @Description: 文本转语音控制器
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import {
  Controller,
  Post,
  Body,
  Get,
  Header,
  Res,
  HttpException,
  HttpStatus,
  Query,
  Param,
  Req,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { TtsService } from './tts.service';
import {
  TtsRequestDto,
  WordTtsRequestDto,
  BatchTtsRequestDto,
  GetAudioUrlRequestDto,
} from './dto/tts-request.dto';
import {
  TtsResponseDto,
  VoiceListResponseDto,
  BatchTtsResponseDto,
} from './dto/tts-response.dto';
import {
  BatchTtsRequestDto as StorageBatchTtsRequestDto,
  BatchTtsResponseDto as StorageBatchTtsResponseDto,
  TtsQueryDto,
  TtsRecordDetailDto,
} from './dto/batch-tts.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('文本转语音')
@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post('synthesize')
  @Public()
  @ApiOperation({
    summary: '文本转语音',
    description:
      '将文本转换为语音文件（MP3格式）。支持自定义语音、语速、音调等参数。',
  })
  @ApiBody({
    type: TtsRequestDto,
    description: 'TTS请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '音频文件流',
    headers: {
      'Content-Type': { description: 'audio/mpeg' },
      'Content-Length': { description: '音频文件大小' },
    },
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  @Header('Content-Type', 'audio/mpeg')
  async synthesize(@Body() ttsRequest: TtsRequestDto, @Res() res: Response) {
    try {
      const audioResult = await this.ttsService.textToSpeech(ttsRequest.text, {
        voice: ttsRequest.voice,
        rate: ttsRequest.rate,
        pitch: ttsRequest.pitch,
        volume: ttsRequest.volume,
      });

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioResult.size.toString(),
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'X-Audio-Duration': audioResult.duration?.toString() || '',
        'X-Voice': ttsRequest.voice || '',
      });

      res.send(audioResult.buffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('语音合成失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('synthesize-json')
  @Public()
  @ApiOperation({
    summary: '文本转语音（JSON返回）',
    description: '将文本转换为语音，返回Base64编码的音频数据。',
  })
  @ApiBody({
    type: TtsRequestDto,
    description: 'TTS请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '转换成功',
    type: TtsResponseDto,
  })
  async synthesizeJson(
    @Body() ttsRequest: TtsRequestDto,
  ): Promise<ResponseDto<TtsResponseDto | null>> {
    try {
      const audioResult = await this.ttsService.textToSpeech(ttsRequest.text, {
        voice: ttsRequest.voice,
        rate: ttsRequest.rate,
        pitch: ttsRequest.pitch,
        volume: ttsRequest.volume,
      });

      const response: TtsResponseDto = {
        audioData: `data:audio/mpeg;base64,${audioResult.buffer.toString('base64')}`,
        format: audioResult.format,
        size: audioResult.size,
        duration: audioResult.duration,
        voice: ttsRequest.voice || 'en-US-AriaNeural',
        rate: ttsRequest.rate || 1.0,
        pitch: ttsRequest.pitch || 0,
      };

      return new ResponseDto(200, response, '语音合成成功');
    } catch (error) {
      return new ResponseDto<null>(
        500,
        null,
        error instanceof HttpException ? error.message : '语音合成失败',
      );
    }
  }

  @Post('word')
  @Public()
  @ApiOperation({
    summary: '单词发音',
    description: '为单个单词生成发音音频，特别适用于英语学习。',
  })
  @ApiBody({
    type: WordTtsRequestDto,
    description: '单词发音请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '音频文件流',
  })
  @Header('Content-Type', 'audio/mpeg')
  async wordPronunciation(
    @Body() wordRequest: WordTtsRequestDto,
    @Res() res: Response,
  ) {
    try {
      const audioResult = await this.ttsService.wordPronunciation(
        wordRequest.word,
        wordRequest.voice,
        wordRequest.rate,
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioResult.size.toString(),
        'Content-Disposition': `inline; filename="${wordRequest.word}_pronunciation.mp3"`,
        'X-Word': wordRequest.word,
        'X-Voice': wordRequest.voice || '',
      });

      res.send(audioResult.buffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        '单词发音生成失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('batch')
  @ApiOperation({
    summary: '批量文本转语音',
    description:
      '批量转换多个文本为语音，支持自定义间隔时间。适用于听写练习等场景。',
  })
  @ApiBody({
    type: BatchTtsRequestDto,
    description: '批量TTS请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '批量转换成功',
    type: BatchTtsResponseDto,
  })
  @ApiBearerAuth('bearer')
  async batchSynthesize(
    @Body() batchRequest: BatchTtsRequestDto,
  ): Promise<ResponseDto<BatchTtsResponseDto | null>> {
    try {
      const audioResults = await this.ttsService.batchTextToSpeech(
        batchRequest.texts,
        {
          voice: batchRequest.voice,
          rate: batchRequest.rate,
        },
        batchRequest.interval,
      );

      const audioFiles = audioResults.map((result, index) => ({
        text: batchRequest.texts[index],
        audioData: `data:audio/mpeg;base64,${result.buffer.toString('base64')}`,
        format: result.format,
        size: result.size,
      }));

      const totalSize = audioResults.reduce(
        (sum, result) => sum + result.size,
        0,
      );

      const response: BatchTtsResponseDto = {
        audioFiles,
        total: audioFiles.length,
        totalSize,
        voice: batchRequest.voice || 'en-US-AriaNeural',
      };

      return new ResponseDto(200, response, '批量语音合成成功');
    } catch (error) {
      return new ResponseDto<null>(
        500,
        null,
        error instanceof HttpException ? error.message : '批量语音合成失败',
      );
    }
  }

  @Post('merge-audio')
  @ApiOperation({
    summary: '合并音频',
    description: '将多个文本转换为一个合并的音频文件，适用于听写练习。',
  })
  @ApiBody({
    type: BatchTtsRequestDto,
    description: '音频合并请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '合并音频文件流',
  })
  @Header('Content-Type', 'audio/mpeg')
  @ApiBearerAuth('bearer')
  async mergeAudio(
    @Body() batchRequest: BatchTtsRequestDto,
    @Res() res: Response,
  ) {
    try {
      // 先批量生成音频
      const audioResults = await this.ttsService.batchTextToSpeech(
        batchRequest.texts,
        {
          voice: batchRequest.voice,
          rate: batchRequest.rate,
        },
        0, // 批量生成时不加间隔
      );

      // 合并音频
      const mergedAudio = await this.ttsService.mergeAudioBuffers(
        audioResults,
        batchRequest.interval || 1000,
      );

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': mergedAudio.size.toString(),
        'Content-Disposition': 'inline; filename="merged_audio.mp3"',
        'X-Audio-Count': batchRequest.texts.length.toString(),
        'X-Total-Duration': mergedAudio.duration?.toString() || '',
      });

      res.send(mergedAudio.buffer);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('音频合并失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('voices')
  @Public()
  @ApiOperation({
    summary: '获取可用语音列表',
    description: '返回所有可用的语音选项，包括语音名称、性别、语言等信息。',
  })
  @ApiQuery({
    name: 'detailed',
    required: false,
    description: '是否返回详细语音列表（包含完整的语音库）',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: VoiceListResponseDto,
  })
  async getVoices(
    @Query('detailed') detailed?: boolean,
  ): Promise<ResponseDto<VoiceListResponseDto | null>> {
    try {
      const voices = detailed
        ? await this.ttsService.getAllVoices()
        : await this.ttsService.getVoices();

      const response: VoiceListResponseDto = {
        voices,
        total: voices.length,
      };

      return new ResponseDto(200, response, '获取语音列表成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '获取语音列表失败');
    }
  }

  @Post('validate-voice')
  @Public()
  @ApiOperation({
    summary: '验证语音是否可用',
    description: '检查指定的语音名称是否在可用列表中。',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        voice: {
          type: 'string',
          example: 'en-US-AriaNeural',
          description: '要验证的语音名称',
        },
      },
      required: ['voice'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '验证结果',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            voice: { type: 'string', example: 'en-US-AriaNeural' },
            isValid: { type: 'boolean', example: true },
          },
        },
        errmsg: { type: 'string', example: '验证成功' },
      },
    },
  })
  async validateVoice(
    @Body() body: { voice: string },
  ): Promise<ResponseDto<{ voice: string; isValid: boolean } | null>> {
    try {
      const isValid = await this.ttsService.validateVoice(body.voice);

      return new ResponseDto(200, { voice: body.voice, isValid }, '验证成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '验证失败');
    }
  }

  @Post('batch-with-storage')
  @Public()
  @ApiOperation({
    summary: '批量文本转语音并存储',
    description:
      '批量转换文本为语音并存储到OSS，自动去重，避免重复生成。适用于大量文本的语音化处理。',
  })
  @ApiBody({
    type: StorageBatchTtsRequestDto,
    description: '批量TTS存储请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '批量转换成功',
    type: StorageBatchTtsResponseDto,
  })
  async batchSynthesizeWithStorage(
    @Body() batchRequest: StorageBatchTtsRequestDto,
    @Req() req: Request,
  ): Promise<ResponseDto<StorageBatchTtsResponseDto | null>> {
    try {
      // 获取用户ID（如果有登录）
      const userId = (req as any).user?.id;

      const result = await this.ttsService.batchTextToSpeechWithStorage(
        batchRequest,
        userId,
      );

      return new ResponseDto(200, result, '批量语音合成成功');
    } catch (error) {
      return new ResponseDto<null>(
        500,
        null,
        error instanceof HttpException ? error.message : '批量语音合成失败',
      );
    }
  }

  @Post('text-with-storage')
  @Public()
  @ApiOperation({
    summary: '文本转语音并存储',
    description:
      '将文本转换为语音并存储到OSS，如果已存在相同的音频则直接返回。',
  })
  @ApiBody({
    type: TtsRequestDto,
    description: 'TTS请求参数',
  })
  @ApiResponse({
    status: 200,
    description: '转换成功',
  })
  async synthesizeWithStorage(
    @Body() ttsRequest: TtsRequestDto,
    @Req() req: Request,
  ): Promise<ResponseDto<any | null>> {
    try {
      const userId = (req as any).user?.id;

      const result = await this.ttsService.textToSpeechWithStorage(
        ttsRequest.text,
        {
          voice: ttsRequest.voice,
          rate: ttsRequest.rate,
          pitch: ttsRequest.pitch,
          volume: ttsRequest.volume,
        },
        userId,
      );

      return new ResponseDto(200, result, '语音合成成功');
    } catch (error) {
      return new ResponseDto<null>(
        500,
        null,
        error instanceof HttpException ? error.message : '语音合成失败',
      );
    }
  }

  @Get('records')
  @Public()
  @ApiOperation({
    summary: '查询TTS音频记录',
    description: '分页查询TTS音频记录，支持关键词查找和类型过滤。',
  })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'voice', required: false, description: '语音类型过滤' })
  @ApiQuery({ name: 'type', required: false, description: '音频类型过滤' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '页码',
    type: Number,
  })
  @ApiQuery({
    name: 'page_size',
    required: false,
    description: '每页数量',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
  })
  async getTtsRecords(
    @Query() query: TtsQueryDto,
  ): Promise<ResponseDto<any | null>> {
    try {
      const result = await this.ttsService.queryTtsRecords(query);
      return new ResponseDto(200, result, '查询成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '查询失败');
    }
  }

  @Get('records/:id')
  @Public()
  @ApiOperation({
    summary: '获取TTS音频记录详情',
    description: '根据ID获取TTS音频记录的详细信息。',
  })
  @ApiParam({ name: 'id', description: '记录ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TtsRecordDetailDto,
  })
  async getTtsRecord(
    @Param('id') id: number,
  ): Promise<ResponseDto<TtsRecordDetailDto | null>> {
    try {
      const record = await this.ttsService.getTtsRecordById(id);

      if (!record) {
        return new ResponseDto<null>(404, null, '记录不存在');
      }

      return new ResponseDto(200, record, '获取成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '获取失败');
    }
  }

  @Delete('records/:id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '删除TTS音频记录',
    description: '删除指定的TTS音频记录。',
  })
  @ApiParam({ name: 'id', description: '记录ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  async deleteTtsRecord(@Param('id') id: number): Promise<ResponseDto<null>> {
    try {
      const success = await this.ttsService.deleteTtsRecord(id);

      if (!success) {
        return new ResponseDto<null>(404, null, '记录不存在');
      }

      return new ResponseDto<null>(200, null, '删除成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '删除失败');
    }
  }

  @Get('statistics')
  @Public()
  @ApiOperation({
    summary: '获取TTS统计信息',
    description: '获取TTS系统的统计信息，包括总记录数、文件大小、语音分布等。',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  async getTtsStatistics(): Promise<ResponseDto<any | null>> {
    try {
      const stats = await this.ttsService.getTtsStatistics();
      return new ResponseDto(200, stats, '获取统计信息成功');
    } catch (error) {
      return new ResponseDto<null>(500, null, '获取统计信息失败');
    }
  }

  @Post('get-audio-url')
  @Public()
  @ApiOperation({
    summary: '获取单词或文本的音频URL',
    description:
      '智能识别输入的单词或中文文本，自动选择合适的语音进行转换，返回对应的MP3文件URL。支持缓存机制，避免重复生成。',
  })
  @ApiBody({
    type: GetAudioUrlRequestDto,
    description: '音频URL获取请求参数',
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
            file_url: {
              type: 'string',
              example: 'https://oss.example.com/voice/hello_abc123.mp3',
              description: '音频文件URL',
            },
            is_new: {
              type: 'boolean',
              example: true,
              description: '是否为新生成的文件',
            },
            voice_used: {
              type: 'string',
              example: 'en-US-AriaNeural',
              description: '使用的语音类型',
            },
            file_size: {
              type: 'number',
              example: 12345,
              description: '文件大小（字节）',
            },
            duration: {
              type: 'number',
              example: 1.5,
              description: '音频时长（秒）',
            },
          },
        },
        errmsg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getAudioUrl(
    @Body() request: GetAudioUrlRequestDto,
    @Req() req: Request,
  ): Promise<ResponseDto<any | null>> {
    try {
      const userId = (req as any).user?.id;

      const result = await this.ttsService.getAudioUrl(
        request.text,
        {
          voice: request.voice,
          rate: request.rate,
        },
        userId,
        request.force_regenerate,
      );

      return new ResponseDto(200, result, '获取音频URL成功');
    } catch (error) {
      return new ResponseDto<null>(
        500,
        null,
        error instanceof HttpException ? error.message : '获取音频URL失败',
      );
    }
  }
}
