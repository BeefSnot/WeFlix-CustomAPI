const crypto = require('crypto');

const SECRET = process.env.STREAM_TOKEN_SECRET || (process.env.JWT_SECRET || 'change-me');
const DEFAULT_TTL = parseInt(process.env.STREAM_TOKEN_TTL_SECONDS || '900', 10); // 15 min

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function sign(id, ttlSec = DEFAULT_TTL) {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = `${id}.${exp}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}
function verify(token, id) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [tid, expStr, sigB64] = parts;
  if (String(tid) !== String(id)) return false;
  const exp = parseInt(expStr, 10);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${tid}.${exp}`;
  const expected = b64url(crypto.createHmac('sha256', SECRET).update(payload).digest());
  return crypto.timingSafeEqual(Buffer.from(sigB64), Buffer.from(expected));
}

module.exports = { sign, verify };