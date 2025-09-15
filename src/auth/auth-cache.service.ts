/*
 * @Author: wanglx
 * @Date: 2025-09-15 18:13:49
 * @LastEditors: wanglx
 * @LastEditTime: 2025-09-15 18:18:19
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager_1 from 'cache-manager';

@Injectable()
export class AuthCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
  ) {}

  async setUserToken(
    userId: number,
    token: string,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    // 存储用户token，用于后续验证和注销
    await this.cacheManager.set(`user_token:${userId}`, token, ttl * 1000);
  }

  async getUserToken(userId: number): Promise<string | null> {
    const token = await this.cacheManager.get(`user_token:${userId}`);
    return token ? (token as string) : null;
  }

  async removeUserToken(userId: number): Promise<void> {
    await this.cacheManager.del(`user_token:${userId}`);
  }

  async setUserInfo(
    userId: number,
    userInfo: any,
    ttl: number = 7 * 24 * 60 * 60,
  ): Promise<void> {
    // 存储用户信息到缓存
    await this.cacheManager.set(`user_info:${userId}`, userInfo, ttl * 1000);
  }

  async getUserInfo(userId: number): Promise<any | null> {
    const userInfo = await this.cacheManager.get(`user_info:${userId}`);
    return userInfo ? userInfo : null;
  }

  async removeUserInfo(userId: number): Promise<void> {
    await this.cacheManager.del(`user_info:${userId}`);
  }
}
