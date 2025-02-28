import * as Redis from 'ioredis';
import { redisConfig } from 'src/common/config/config-helper';

export class RedisHelper {
  private static redis: Redis.Redis | Redis.Cluster;
  static initRedis() {
    this.redis = redisConfig.cluster.host
      ? new Redis.Cluster(
          [
            {
              host: redisConfig.cluster.host,
              port: redisConfig.cluster.port,
            },
          ],
          { enableReadyCheck: false },
        )
      : new Redis.Redis(redisConfig.standalone.port, redisConfig.standalone.host, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
    return this.redis;
  }

  static getRedis() {
    if (!this.redis) {
      return RedisHelper.initRedis();
    }
    return this.redis;
  }
}
