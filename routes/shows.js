const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const SHOWS_DIR = process.env.SHOWS_DIR || '/home/dynastyhosting/domains/weflix.jameshamby.me/public_html/Shows';
const VIDEO_EXT = new Set(['.mp4', '.mkv', '.avi', '.mov', '.m4v', '.webm']);

/**
 * @openapi
 * /api/shows:
 *   get:
 *     summary: List shows/files from SHOWS_DIR
 */
router.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '50', q = '' } = req.query;
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
        const term = String(q).toLowerCase();

        const entries = await fs.readdir(SHOWS_DIR, { withFileTypes: true });
        let items = await Promise.all(entries.map(async e => {
            const full = path.join(SHOWS_DIR, e.name);
            if (e.isDirectory()) return { type: 'dir', name: e.name, path: full };
            if (e.isFile() && VIDEO_EXT.has(path.extname(e.name).toLowerCase())) {
                const s = await fs.stat(full);
                return { type: 'file', name: e.name, size: s.size, mtime: s.mtimeMs, path: full };
            }
            return null;
        }));
        items = items.filter(Boolean);
        if (term) items = items.filter(i => i.name.toLowerCase().includes(term));
        items.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));

        const total = items.length;
        const start = (pageNum - 1) * pageSize;
        res.json({ dir: SHOWS_DIR, total, page: pageNum, limit: pageSize, items: items.slice(start, start + pageSize) });
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.set('X-Shows-Dir', SHOWS_DIR);
            return res.json({ dir: SHOWS_DIR, total: 0, items: [], message: 'Shows directory not found' });
        }
        res.status(500).json({ error: 'Failed to read shows directory', message: err.message });
    }
});

module.exports = router;