import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TokenUtils } from '../auth/token.utils';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseDto } from '../common/dto/response.dto';

class ProtectedDataResponseDto {
  message: string;
  user: any;
}

class TokenInfoResponseDto {
  token?: string;
  decoded?: any;
  verification?: any;
  error?: string;
}

class PublicDataResponseDto {
  message: string;
}

@ApiTags('示例')
@Controller('example')
export class ExampleController {
  constructor(private readonly tokenUtils: TokenUtils) {}

  @Get('protected')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '受保护的路由示例',
    description: '需要有效的JWT token才能访问',
  })
  @ApiResponse({
    status: 200,
    description: '返回用户信息',
    type: ResponseDto<ProtectedDataResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: '未授权',
    type: ResponseDto<null>,
  })
  getProtectedData(
    @Req() request: Request,
  ): ResponseDto<ProtectedDataResponseDto> {
    const user = (request as any).user;
    return new ResponseDto(
      200,
      {
        message: '这是受保护的路由',
        user: user,
      },
      undefined,
    );
  }

  @Get('token-info')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取token信息',
    description: '使用TokenUtils服务解析token信息',
  })
  @ApiResponse({
    status: 200,
    description: '返回token信息',
    type: ResponseDto<TokenInfoResponseDto>,
  })
  async getTokenInfo(
    @Req() request: Request,
  ): Promise<ResponseDto<TokenInfoResponseDto>> {
    const token = this.tokenUtils.extractTokenFromHeader(request);
    if (!token) {
      return new ResponseDto(401, { error: '未提供token' }, undefined);
    }

    // 解码token（不验证）
    const decoded = this.tokenUtils.decodeToken(token);

    // 验证token
    const verification = await this.tokenUtils.verifyToken(token);

    return new ResponseDto(
      200,
      {
        token,
        decoded,
        verification,
      },
      undefined,
    );
  }

  @Get('public')
  @Public()
  @ApiOperation({
    summary: '公开路由示例',
    description: '无需token即可访问',
  })
  @ApiResponse({
    status: 200,
    description: '返回公开信息',
    type: ResponseDto<PublicDataResponseDto>,
  })
  getPublicData(): ResponseDto<PublicDataResponseDto> {
    return new ResponseDto(
      200,
      {
        message: '这是公开的路由，无需token',
      },
      undefined,
    );
  }
}
