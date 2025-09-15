import { Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis.service';

@Injectable()
export class ExampleService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * 示例：存储用户会话数据
   * @param userId 用户ID
   * @param sessionData 会话数据
   * @param ttl 过期时间（秒）
   */
  async storeUserSession(
    userId: number,
    sessionData: any,
    ttl: number = 3600,
  ): Promise<void> {
    await this.redisService.set(`user_session:${userId}`, sessionData, ttl);
  }

  /**
   * 示例：获取用户会话数据
   * @param userId 用户ID
   * @returns 会话数据
   */
  async getUserSession(userId: number): Promise<any> {
    return await this.redisService.get(`user_session:${userId}`);
  }

  /**
   * 示例：存储用户偏好设置
   * @param userId 用户ID
   * @param preferences 偏好设置
   * @param ttl 过期时间（秒）
   */
  async storeUserPreferences(
    userId: number,
    preferences: any,
    ttl: number = 7 * 24 * 3600,
  ): Promise<void> {
    await this.redisService.hset(
      `user_preferences`,
      userId.toString(),
      preferences,
      ttl,
    );
  }

  /**
   * 示例：获取用户偏好设置
   * @param userId 用户ID
   * @returns 偏好设置
   */
  async getUserPreferences(userId: number): Promise<any> {
    return await this.redisService.hget(`user_preferences`, userId.toString());
  }

  /**
   * 示例：增加用户积分
   * @param userId 用户ID
   * @param points 积分数量
   * @returns 更新后的积分
   */
  async addUserPoints(userId: number, points: number): Promise<number> {
    return await this.redisService.incr(`user_points:${userId}`, points);
  }

  /**
   * 示例：获取用户积分
   * @param userId 用户ID
   * @returns 用户积分
   */
  async getUserPoints(userId: number): Promise<number> {
    const points = await this.redisService.get<number>(`user_points:${userId}`);
    return points || 0;
  }

  /**
   * 示例：添加用户到在线用户集合
   * @param userId 用户ID
   */
  async addUserToOnlineSet(userId: number): Promise<void> {
    await this.redisService.sadd('online_users', userId, 3600); // 1小时过期
  }

  /**
   * 示例：从在线用户集合中移除用户
   * @param userId 用户ID
   */
  async removeUserFromOnlineSet(userId: number): Promise<void> {
    await this.redisService.srem('online_users', userId);
  }

  /**
   * 示例：获取所有在线用户
   * @returns 在线用户列表
   */
  async getOnlineUsers(): Promise<number[]> {
    return await this.redisService.smembers<number>('online_users');
  }
}
