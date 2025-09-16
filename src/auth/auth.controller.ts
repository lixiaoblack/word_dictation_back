import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { ResponseDto } from '../dto';

class LoginResponseDto {
  user: {
    id: number;
    uuid: string;
    username: string;
    phone: string;
    email: string;
    is_guest: boolean;
    created_at: Date;
    updated_at: Date;
  };
  token: string;
}

class ProfileResponseDto {
  id: number;
  uuid: string;
  username: string;
  phone: string;
  email: string;
  is_guest: boolean;
  created_at: Date;
  updated_at: Date;
}

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '用户登录',
    description: '根据手机号或邮箱登录，如果用户不存在则自动注册',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      phone: {
        summary: '手机号登录',
        value: {
          identifier: '13800138000',
          password: 'password123',
        },
      },
      email: {
        summary: '邮箱登录',
        value: {
          identifier: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: ResponseDto<LoginResponseDto>,
  })
  @ApiResponse({
    status: 401,
    description: '密码错误',
    type: ResponseDto<null>,
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ResponseDto<LoginResponseDto> | ResponseDto<null>> {
    try {
      const result = await this.authService.login(
        loginDto.identifier,
        loginDto.password,
      );
      return new ResponseDto(200, result, undefined);
    } catch (error) {
      return new ResponseDto(401, null, error.message);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '用户登出',
    description: '用户登出，清除Redis中的用户信息',
  })
  @ApiResponse({
    status: 200,
    description: '登出成功',
    type: ResponseDto<null>,
  })
  async logout(@CurrentUser() user: User): Promise<ResponseDto<null>> {
    await this.authService.logout(user.id);
    return new ResponseDto(200, null, '登出成功');
  }

  @Get('checkRedis')
  @Public()
  async checkRedis(): Promise<ResponseDto<any>> {
    const result = await this.authService.checkRedis();
    return new ResponseDto(200, result, undefined);
  }
}
