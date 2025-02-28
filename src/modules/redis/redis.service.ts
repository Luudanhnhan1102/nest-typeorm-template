import { Injectable } from '@nestjs/common';
import * as Redis from 'ioredis';
import { RedisHelper } from './redis.helper';

@Injectable()
export class RedisService {
  private readonly redis: Redis.Redis | Redis.Cluster;

  constructor() {
    this.redis = RedisHelper.getRedis();
  }

  async set(key: string, value: string, expireTime: number): Promise<void> {
    await this.redis.set(key, value, 'EX', expireTime);
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
