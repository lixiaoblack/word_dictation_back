/*
 * @Author: wanglx
 * @Date: 2025-09-15 18:14:55
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-16 18:09:17
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDetailDto } from './dto/update-user-detail.dto';
import { UserDetail } from './entities/user-detail.entity';
import { ResponseDto } from '../dto';

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
    type: ResponseDto<User>,
  })
  async getProfile(@CurrentUser() user: User): Promise<ResponseDto<User>> {
    // 获取用户详情并添加到用户对象中
    const userDetail = await this.usersService.getUserDetail(user.id);
    if (userDetail) {
      user.detail = userDetail;
    }
    return new ResponseDto(200, user, undefined);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '更新用户信息',
    description: '更新当前认证用户的详细信息',
  })
  @ApiResponse({
    status: 200,
    description: '用户信息更新成功',
    type: ResponseDto<UserDetail>,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ResponseDto<null>,
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDetailDto: UpdateUserDetailDto,
  ): Promise<ResponseDto<UserDetail> | ResponseDto<null>> {
    try {
      const result = await this.usersService.updateUserDetail(
        user.id,
        updateUserDetailDto,
      );
      return new ResponseDto(200, result, undefined);
    } catch (error) {
      return new ResponseDto(400, null, error.message);
    }
  }
}
