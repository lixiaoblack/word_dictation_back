/*
 * @Author: wanglx
 * @Date: 2025-09-15 18:37:34
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 22:08:32
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
