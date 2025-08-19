const { randomUUID } = require('crypto');

module.exports = function requestLogger(req, res, next) {
  const id = randomUUID();
  req.requestId = id;
  const start = Date.now();
  res.setHeader('X-Request-Id', id);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${id}] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
};