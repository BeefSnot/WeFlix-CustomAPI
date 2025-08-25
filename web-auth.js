// Minimal client auth helper (no framework)
const KEY = 'weflix.jwt';

export function saveToken(token) { localStorage.setItem(KEY, token); }
export function loadToken() { return localStorage.getItem(KEY) || null; }
export function logout() { localStorage.removeItem(KEY); window.location.href = '/login.html'; }

export function parseJwt(token) {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

export function currentUser() {
  const t = loadToken();
  if (!t) return null;
  const p = parseJwt(t);
  if (!p) return null;
  const now = Math.floor(Date.now() / 1000);
  if (p.exp && p.exp < now) { logout(); return null; }
  return p;
}

export async function authFetch(url, opts = {}) {
  const token = loadToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...opts, headers });
}

export function requireAuth() {
  const u = currentUser();
  if (!u) window.location.href = '/login.html';
  return u;
}