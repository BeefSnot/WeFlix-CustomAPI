const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const auth = require('../src/middleware/auth');

const router = express.Router();
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

const extraFile = path.resolve(__dirname, '..', 'data', 'seeds.extra.json');

async function loadExtra() {
  try {
    const buf = await fs.readFile(extraFile, 'utf8');
    return JSON.parse(buf);
  } catch {
    return [];
  }
}

router.post('/', auth(), requireAdmin, async (req, res) => {
  // Accepts same shape as a seed item, including _src
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title required' });

  try {
    const list = await loadExtra();
    const idx = list.findIndex(x => x && x.title === title);
    if (idx >= 0) list[idx] = { ...list[idx], ...req.body };
    else list.push(req.body);

    await fs.mkdir(path.dirname(extraFile), { recursive: true });
    await fs.writeFile(extraFile, JSON.stringify(list, null, 2));
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to persist seed' });
  }
});

module.exports = router;