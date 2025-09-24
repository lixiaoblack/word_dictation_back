import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // 初始化 Redis 连接
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      db: 0,
    });

    // 测试连接
    try {
      await this.client.ping();
      console.log('[RedisService] Redis 连接成功');
    } catch (error) {
      console.error('[RedisService] Redis 连接失败:', error);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * 设置缓存
   * @param key 键
   * @param value 值
   * @param ttl 过期时间（秒），默认为1小时
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : value.toString();
    if (ttl) {
      await this.client.setex(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  /**
   * 获取缓存
   * @param key 键
   * @returns 缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * 删除缓存
   * @param key 键
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   * @param key 键
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置哈希值
   * @param hashKey 哈希键
   * @param field 字段
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async hset(
    hashKey: string,
    field: string,
    value: any,
    ttl?: number,
  ): Promise<void> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : value.toString();
    await this.client.hset(hashKey, field, stringValue);
    if (ttl) {
      await this.client.expire(hashKey, ttl);
    }
  }

  /**
   * 获取哈希值
   * @param hashKey 哈希键
   * @param field 字段
   * @returns 值
   */
  async hget<T>(hashKey: string, field: string): Promise<T | null> {
    const value = await this.client.hget(hashKey, field);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * 删除哈希字段
   * @param hashKey 哈希键
   * @param field 字段
   */
  async hdel(hashKey: string, field: string): Promise<void> {
    await this.client.hdel(hashKey, field);
  }

  /**
   * 获取哈希所有字段和值
   * @param hashKey 哈希键
   * @returns 字段和值的映射
   */
  async hgetall<T>(hashKey: string): Promise<Record<string, T> | null> {
    const result = await this.client.hgetall(hashKey);
    if (Object.keys(result).length === 0) return null;

    const parsedResult: Record<string, T> = {};
    for (const [key, value] of Object.entries(result)) {
      try {
        parsedResult[key] = JSON.parse(value) as T;
      } catch {
        parsedResult[key] = value as unknown as T;
      }
    }

    return parsedResult;
  }

  /**
   * 增加数值
   * @param key 键
   * @param amount 增加的数量，默认为1
   * @returns 增加后的值
   */
  async incr(key: string, amount: number = 1): Promise<number> {
    return await this.client.incrby(key, amount);
  }

  /**
   * 减少数值
   * @param key 键
   * @param amount 减少的数量，默认为1
   * @returns 减少后的值
   */
  async decr(key: string, amount: number = 1): Promise<number> {
    return await this.client.decrby(key, amount);
  }

  /**
   * 添加到集合
   * @param key 集合键
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async sadd(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : value.toString();
    await this.client.sadd(key, stringValue);
    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }

  /**
   * 从集合中移除
   * @param key 集合键
   * @param value 值
   */
  async srem(key: string, value: any): Promise<void> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : value.toString();
    await this.client.srem(key, stringValue);
  }

  /**
   * 获取集合所有成员
   * @param key 集合键
   * @returns 集合成员数组
   */
  async smembers<T>(key: string): Promise<T[]> {
    const members = await this.client.smembers(key);
    return members.map((member) => {
      try {
        return JSON.parse(member) as T;
      } catch {
        return member as unknown as T;
      }
    });
  }

  /**
   * 检查成员是否在集合中
   * @param key 集合键
   * @param value 值
   * @returns 是否存在
   */
  async sismember(key: string, value: any): Promise<boolean> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : value.toString();
    const result = await this.client.sismember(key, stringValue);
    return result === 1;
  }

  /**
   * 获取所有键
   * @returns 键数组
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    return await this.client.keys(pattern);
  }
}
