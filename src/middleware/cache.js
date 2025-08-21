const redis = require('redis');

// In-memory fallback store
const store = new Map();

// Redis client setup with socket connection for DirectAdmin
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
            reconnectStrategy: false // Don't auto-reconnect
          }
        });
        
        // Suppress error logging after first attempt
        redisClient.on('error', () => {
          useRedis = false;
        });

        await redisClient.connect();
        console.log(`✅ Redis connected via socket: ${socketPath}`);
        useRedis = true;
        break;
      } catch (err) {
        if (redisClient) {
          try { await redisClient.disconnect(); } catch {}
          redisClient = null;
        }
      }
    }
    
    if (!useRedis) {
      console.log('⚠️  Redis socket connection failed, using in-memory cache fallback');
      if (customSocketPath) {
        console.log(`   💡 Custom socket path was: ${customSocketPath}`);
      }
      console.log('   💡 To use Redis, set REDIS_SOCKET_PATH environment variable');
    }
  } catch (err) {
    console.log('⚠️  Redis initialization failed, using in-memory cache:', err.message);
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

module.exports = function cache(ttlSeconds = 30) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    // Ensure Redis is initialized
    await ensureRedisInit();
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      let hit = null;
      
      // Try Redis first if available
      if (useRedis && redisClient) {
        try {
          const cached = await redisClient.get(key);
          if (cached) {
            hit = JSON.parse(cached);
          }
        } catch (err) {
          useRedis = false;
        }
      }
      
      // Fallback to in-memory cache
      if (!hit && !useRedis) {
        const memHit = store.get(key);
        const now = Date.now();
        if (memHit && memHit.expires > now) {
          hit = memHit;
        }
      }
      
      // Return cached response if found
      if (hit) {
        return res.json(hit.payload);
      }
      
      // Cache the response
      const original = res.json.bind(res);
      res.json = async (body) => {
        const cacheData = { 
          payload: body, 
          expires: Date.now() + ttlSeconds * 1000 
        };
        
        // Try to cache in Redis first
        if (useRedis && redisClient) {
          try {
            await redisClient.setEx(key, ttlSeconds, JSON.stringify(cacheData));
          } catch (err) {
            useRedis = false;
            // Fallback to memory cache
            store.set(key, cacheData);
          }
        } else {
          // Use in-memory cache
          store.set(key, cacheData);
        }
        
        return original(body);
      };
      
      next();
    } catch (err) {
      console.log('Cache middleware error:', err.message);
      // Continue without caching on any error
      next();
    }
  };
};