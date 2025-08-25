const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const auth = require('../src/middleware/auth');
const { setAll } = require('../src/streamsStore'); // writes data/streams.json

const router = express.Router();
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

const streamsFile = path.resolve(__dirname, '..', 'data', 'streams.json');
async function readMap() { try { return JSON.parse(await fs.readFile(streamsFile, 'utf8')); } catch { return {}; } }

// GET current mapping
router.get('/:id', auth(), requireAdmin, async (req, res) => {
  const map = await readMap();
  const id = String(req.params.id);
  res.json({ id, src: map[id] || null });
});

// PUT set mapping
router.put('/:id', auth(), requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const { src } = req.body || {};
  if (!src || typeof src !== 'string') return res.status(400).json({ message: 'src required' });
  const ok = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/');
  if (!ok) return res.status(400).json({ message: 'src must be http(s) or absolute path' });
  const map = await readMap();
  map[id] = src.trim();
  setAll(map);
  res.status(204).end();
});

// DELETE mapping
router.delete('/:id', auth(), requireAdmin, async (req, res) => {
  const id = String(req.params.id);
  const map = await readMap();
  if (map[id]) { delete map[id]; setAll(map); }
  res.status(204).end();
});

module.exports = router;