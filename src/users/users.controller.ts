import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '获取当前认证用户的信息',
  })
  @ApiResponse({
    status: 200,
    description: '返回用户信息',
    type: User,
  })
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
