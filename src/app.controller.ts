import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto';

@ApiTags('健康检查')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '获取服务问候信息',
    description: '返回服务的问候信息，用于验证服务是否正常运行',
  })
  @ApiResponse({
    status: 200,
    description: '返回问候信息',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: '服务健康检查',
    description: '检查服务的运行状态和基本信息',
  })
  @ApiResponse({
    status: 200,
    description: '返回服务健康状态',
    type: HealthCheckResponseDto,
  })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'en-study-backend',
      version: '1.0.0',
    };
  }
}
