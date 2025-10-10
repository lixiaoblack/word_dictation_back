/*
 * @Author: wanglx
 * @Date: 2025-09-25 18:30:00
 * @LastEditors: wanglx
 * @LastEditTime: 2025-10-10 10:09:30
 * @Description: 听写控制器
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DictationService } from './dictation.service';
import { ResponseDto } from '../common/dto/response.dto';
import {
  CreateDictationDto,
  DictationRecordQueryDto,
  DictationRecordResponseDto,
  SubmitDictationAnswerDto,
} from './dto/dictation.dto';
import { DictationRecord } from './entities/dictation-record.entity';

@ApiTags('听写管理')
@Controller('dictation')
@ApiBearerAuth('bearer')
export class DictationController {
  constructor(private readonly dictationService: DictationService) {}

  @Post('records')
  @ApiOperation({
    summary: '创建听写记录',
    description:
      '根据图片识别结果创建一次听写记录，包含所有识别到的单词和补充信息',
  })
  @ApiResponse({
    status: 201,
    description: '听写记录创建成功',
    type: ResponseDto<DictationRecord>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async createDictationRecord(
    @Body(ValidationPipe) createDictationDto: CreateDictationDto,
  ): Promise<ResponseDto<DictationRecord> | ResponseDto<null>> {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const result = await this.dictationService.createDictationRecord(
        createDictationDto,
        userId,
      );

      return new ResponseDto(200, result, '听写记录创建成功');
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '创建听写记录失败',
      );
    }
  }

  @Put('records/:id/start')
  @ApiOperation({
    summary: '开始听写',
    description: '开始指定的听写记录，更新状态和开始时间',
  })
  @ApiParam({
    name: 'id',
    description: '听写记录ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '听写开始成功',
    type: ResponseDto<DictationRecord>,
  })
  @ApiResponse({
    status: 404,
    description: '听写记录不存在',
    type: ResponseDto<null>,
  })
  async startDictation(
    @Param('id', ParseIntPipe) dictationId: number,
  ): Promise<ResponseDto<DictationRecord> | ResponseDto<null>> {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const result = await this.dictationService.startDictation(
        dictationId,
        userId,
      );
      return new ResponseDto(200, result, '听写开始成功');
    } catch (error) {
      return new ResponseDto(
        error instanceof Error && error.message.includes('不存在') ? 404 : 500,
        null,
        error instanceof Error ? error.message : '开始听写失败',
      );
    }
  }

  @Post('answers')
  @ApiOperation({
    summary: '提交听写答案',
    description: '提交单个单词的听写答案，系统会自动判断正确性并记录到错题本',
  })
  @ApiResponse({
    status: 200,
    description: '答案提交成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            isCorrect: { type: 'boolean', example: true },
            correctAnswer: { type: 'string', example: 'hello' },
          },
        },
        errmsg: { type: 'string', example: '答案提交成功' },
      },
    },
  })
  async submitDictationAnswer(
    @Body(ValidationPipe) submitAnswerDto: SubmitDictationAnswerDto,
  ): Promise<
    | ResponseDto<{ isCorrect: boolean; correctAnswer: string }>
    | ResponseDto<null>
  > {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const result = await this.dictationService.submitDictationAnswer(
        submitAnswerDto,
        userId,
      );

      return new ResponseDto(200, result, '答案提交成功');
    } catch (error) {
      return new ResponseDto(
        error instanceof Error && error.message.includes('不存在') ? 404 : 500,
        null,
        error instanceof Error ? error.message : '提交答案失败',
      );
    }
  }

  @Put('records/:id/complete')
  @ApiOperation({
    summary: '完成听写',
    description: '完成指定的听写记录，更新状态、完成时间和最终统计',
  })
  @ApiParam({
    name: 'id',
    description: '听写记录ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '听写完成成功',
    type: ResponseDto<DictationRecord>,
  })
  async completeDictation(
    @Param('id', ParseIntPipe) dictationId: number,
  ): Promise<ResponseDto<DictationRecord> | ResponseDto<null>> {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const result = await this.dictationService.completeDictation(
        dictationId,
        userId,
      );
      return new ResponseDto(200, result, '听写完成成功');
    } catch (error) {
      return new ResponseDto(
        error instanceof Error && error.message.includes('不存在') ? 404 : 500,
        null,
        error instanceof Error ? error.message : '完成听写失败',
      );
    }
  }

  @Get('records')
  @ApiOperation({
    summary: '分页查询听写记录',
    description: '分页查询用户的听写记录，支持按状态和关键词筛选',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: '每页数量',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: '听写状态筛选',
    example: 'completed',
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
    description: '听写名称关键词搜索',
    example: '第一次',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            records: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/DictationRecordResponseDto',
              },
            },
            total: { type: 'number', example: 25 },
            page: { type: 'number', example: 1 },
            pageSize: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 3 },
          },
        },
        errmsg: { type: 'string', example: '查询成功' },
      },
    },
  })
  async getDictationRecords(
    @Query(ValidationPipe) queryDto: DictationRecordQueryDto,
  ): Promise<ResponseDto<any>> {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const { records, total } =
        await this.dictationService.getDictationRecords(queryDto, userId);

      const { page = 1, pageSize = 10 } = queryDto;
      const totalPages = Math.ceil(total / pageSize);

      return new ResponseDto(
        200,
        {
          records,
          total,
          page,
          pageSize,
          totalPages,
        },
        '查询成功',
      );
    } catch (error) {
      return new ResponseDto(
        500,
        null,
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }

  @Get('records/:id')
  @ApiOperation({
    summary: '获取听写详情',
    description: '获取听写记录的详细信息，包括所有单词和答案情况',
  })
  @ApiParam({
    name: 'id',
    description: '听写记录ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            record: { $ref: '#/components/schemas/DictationRecord' },
            words: {
              type: 'array',
              items: { $ref: '#/components/schemas/DictationWord' },
            },
          },
        },
        errmsg: { type: 'string', example: '查询成功' },
      },
    },
  })
  async getDictationDetail(
    @Param('id', ParseIntPipe) dictationId: number,
  ): Promise<ResponseDto<any> | ResponseDto<null>> {
    try {
      // TODO: 从JWT token中获取用户ID
      const userId = 'temp-user-id';

      const result = await this.dictationService.getDictationDetail(
        dictationId,
        userId,
      );
      return new ResponseDto(200, result, '查询成功');
    } catch (error) {
      return new ResponseDto(
        error instanceof Error && error.message.includes('不存在') ? 404 : 500,
        null,
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }
}
