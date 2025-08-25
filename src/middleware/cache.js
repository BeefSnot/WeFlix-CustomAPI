const redis = require('../redis');

const memory = new Map();
const memTTL = new Map();

function memGet(k) {
  const exp = memTTL.get(k);
  if (exp && exp < Date.now()) { memory.delete(k); memTTL.delete(k); return null; }
  return memory.get(k) ?? null;
}
function memSet(k, v, ttlSec) {
  memory.set(k, v);
  memTTL.set(k, Date.now() + ttlSec * 1000);
}

function cache(ttlSec = 60) {
  return async function (req, res, next) {
    if (req.method !== 'GET') return next();
    // Don’t cache streams or movie detail (detail includes a short‑lived token)
    if (req.originalUrl.startsWith('/api/stream')) return next();
    if (/^\/api\/movies\/\d+(\?|$)/.test(req.originalUrl)) return next();

    const key = `weflix:cache:${req.originalUrl}`;
    try {
      if (redis) {
        // Use a pipeline to fetch value + ttl in one round-trip
        const pipe = redis.pipeline().get(key).ttl(key);
        const [[, cached], [, ttl]] = await pipe.exec();
        if (cached) {
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Store', 'redis');
          if (typeof ttl === 'number' && ttl >= 0) res.set('X-Cache-Remaining', String(ttl));
          return res.json(JSON.parse(cached));
        }
      } else {
        const cached = memGet(key);
        if (cached) {
          const exp = memTTL.get(key) || 0;
          const remain = Math.max(0, Math.round((exp - Date.now()) / 1000));
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Store', 'memory');
          res.set('X-Cache-Remaining', String(remain));
          return res.json(cached);
        }
      }

      const _json = res.json.bind(res);
      res.json = async (body) => {
        try {
          if (redis) {
            await redis.set(key, JSON.stringify(body), 'EX', ttlSec);
            res.set('X-Cache-Store', 'redis');
          } else {
            memSet(key, body, ttlSec);
            res.set('X-Cache-Store', 'memory');
          }
          res.set('X-Cache', 'MISS');
          res.set('X-Cache-Remaining', String(ttlSec));
        } catch {}
        return _json(body);
      };

      next();
    } catch {
      next();
    }
  };
}

module.exports = cache;