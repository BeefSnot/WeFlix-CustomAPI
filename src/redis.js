const fs = require('fs');

function createRedis() {
  // Try to load ioredis only if present
  let Redis;
  try {
    Redis = require('ioredis');
  } catch {
    return null; // fall back to in-memory cache
  }

  const sock = process.env.REDIS_SOCKET || '/home/weflix/.redis/redis.sock';
  const url = process.env.REDIS_URL;

  try {
    if (url) {
      return new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
    }
    if (fs.existsSync(sock)) {
      return new Redis({ path: sock, lazyConnect: true, maxRetriesPerRequest: 1 });
    }
    return null;
  } catch {
    return null;
  }
}

module.exports = createRedis();