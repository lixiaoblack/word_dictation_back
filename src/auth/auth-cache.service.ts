/*
 * @Author: wanglx
 * @Date: 2025-09-15 18:13:49
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 22:44:48
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/services/redis.service';

@Injectable()
export class AuthCacheService {
  constructor(private redisService: RedisService) {}

  async setUserToken(
    userId: number,
    token: string,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    // 存储用户token，用于后续验证和注销
    await this.redisService.set(`user_token:${userId}`, token, ttl);
    console.log(`[AuthCacheService] 设置用户 ${userId} 的token: ${token}`);
  }

  async getUserToken(userId: number): Promise<string | null> {
    const token = await this.redisService.get<string>(`user_token:${userId}`);
    console.log(`[AuthCacheService] 获取用户 ${userId} 的token: ${token}`);
    return token;
  }

  async removeUserToken(userId: number): Promise<void> {
    await this.redisService.del(`user_token:${userId}`);
    console.log(`[AuthCacheService] 删除用户 ${userId} 的token`);
  }

  async getUserInfo(userId: number): Promise<any | null> {
    const userInfo = await this.redisService.get<any>(`user_info:${userId}`);
    console.log(`[AuthCacheService] 获取用户 ${userId} 的信息:`, userInfo);
    return userInfo;
  }

  async removeUserInfo(userId: number): Promise<void> {
    await this.redisService.del(`user_info:${userId}`);
    console.log(`[AuthCacheService] 删除用户 ${userId} 的信息`);
  }

  async setexists() {
    try {
      return this.redisService.exists('4');
    } catch (error) {
      return false;
    }
  }

  async getAllKeys() {
    return await this.redisService.keys();
  }
}
