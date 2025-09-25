import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckResponseDto, ResponseDto } from './image-recognition/dto';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('健康检查')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '获取服务问候信息',
    description: '返回服务的问候信息，用于验证服务是否正常运行',
  })
  @ApiResponse({
    status: 200,
    description: '返回问候信息',
    type: ResponseDto,
  })
  getHello(): ResponseDto<string> {
    return new ResponseDto(200, this.appService.getHello(), undefined);
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: '服务健康检查',
    description: '检查服务的运行状态和基本信息',
  })
  @ApiResponse({
    status: 200,
    description: '返回服务健康状态',
    type: ResponseDto<HealthCheckResponseDto>,
  })
  healthCheck(): ResponseDto<HealthCheckResponseDto> {
    return new ResponseDto(
      200,
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'en-study-backend',
        version: '1.0.0',
      },
      undefined,
    );
  }
}
