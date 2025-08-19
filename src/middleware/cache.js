const store = new Map();

module.exports = function cache(ttlSeconds = 30) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl;
    const hit = store.get(key);
    const now = Date.now();
    if (hit && hit.expires > now) return res.json(hit.payload);
    const original = res.json.bind(res);
    res.json = (body) => {
      store.set(key, { payload: body, expires: now + ttlSeconds * 1000 });
      return original(body);
    };
    next();
  };
};