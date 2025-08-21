const redis = require('redis');

// In-memory store reference (same as cache.js)
const store = new Map();

// Redis client setup (mirroring cache.js setup)
let redisClient = null;
let useRedis = false;
let redisInitialized = false;

const initRedis = async () => {
  if (redisInitialized) return;
  redisInitialized = true;
  
  try {
    // Check for custom Redis socket path from environment
    const customSocketPath = process.env.REDIS_SOCKET_PATH;
    
    // Common DirectAdmin Redis socket paths
    const socketPaths = customSocketPath 
      ? [customSocketPath]
      : ['/tmp/redis.sock', '/var/run/redis/redis.sock', '/run/redis/redis.sock'];
    
    for (const socketPath of socketPaths) {
      try {
        redisClient = redis.createClient({ 
          socket: { 
            path: socketPath,
            reconnectStrategy: false
          }
        });
        
        redisClient.on('error', () => {
          useRedis = false;
        });

        await redisClient.connect();
        useRedis = true;
        break;
      } catch (err) {
        if (redisClient) {
          try { await redisClient.disconnect(); } catch {}
          redisClient = null;
        }
      }
    }
  } catch (err) {
    useRedis = false;
  }
};

// Initialize Redis connection once
let initPromise = null;
const ensureRedisInit = () => {
  if (!initPromise) {
    initPromise = initRedis();
  }
  return initPromise;
};

// Cache invalidation function
const invalidateCache = async (pattern = 'cache:/api/movies*') => {
  try {
    // Ensure Redis is initialized
    await ensureRedisInit();
    
    // Clear Redis cache
    if (useRedis && redisClient) {
      try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
          console.log(`📝 Invalidated ${keys.length} Redis cache entries`);
        }
      } catch (err) {
        useRedis = false;
      }
    }
    
    // Clear in-memory cache
    let cleared = 0;
    for (const key of store.keys()) {
      if (key.includes('/api/movies')) {
        store.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      console.log(`📝 Invalidated ${cleared} memory cache entries`);
    }
  } catch (err) {
    console.log('Cache invalidation error:', err.message);
  }
};

// Middleware for automatic cache invalidation on non-GET requests
module.exports = function cacheInvalidation() {
  return async (req, res, next) => {
    // Only invalidate on successful POST, PUT, DELETE
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const originalSend = res.send.bind(res);
      res.send = async function(data) {
        // Only invalidate on successful responses (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await invalidateCache();
        }
        return originalSend(data);
      };
    }
    next();
  };
};

// Export the invalidation function for manual use
module.exports.invalidateCache = invalidateCache;