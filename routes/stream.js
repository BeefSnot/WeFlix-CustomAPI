const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const Movie = require('../models/Movie');
const { getSourceByMovieId } = require('../src/streamsStore');
const { verify } = require('../src/streamToken');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Not found' });

    // Require short-lived token
    const ok = verify(req.query.t, movie.id);
    if (!ok) return res.status(401).json({ message: 'Unauthorized stream' });

    const src = getSourceByMovieId(movie.id);
    res.set('X-Stream-Id', String(movie.id));
    res.set('X-Stream-Configured', src ? 'yes' : 'no');
    if (!src) return res.status(404).json({ message: 'Stream not configured' });

    // Common headers (discourage download; not a guarantee)
    const common = {
      'Cache-Control': 'no-store',
      'Content-Disposition': 'inline',           // no attachment
      'X-Content-Type-Options': 'nosniff'
    };

    if (/^https?:\/\//i.test(src)) {
      const client = src.startsWith('https://') ? https : http;
      const headers = {};
      if (req.headers.range) headers.Range = req.headers.range;
      const upstream = client.request(src, { method: 'GET', headers }, (up) => {
        const h = {
          ...common,
          'content-type': up.headers['content-type'] || 'video/mp4',
          'content-length': up.headers['content-length'],
          'accept-ranges': up.headers['accept-ranges'],
          'content-range': up.headers['content-range'],
        };
        res.writeHead(up.statusCode || 200, Object.fromEntries(Object.entries(h).filter(([, v]) => v)));
        up.pipe(res);
      });
      upstream.on('error', (e) => res.status(502).json({ message: 'Upstream error', error: e.message }));
      upstream.end();
      return;
    }

    const filePath = src;
    const stat = await fs.promises.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const contentType = {
      '.mp4': 'video/mp4',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.m4v': 'video/x-m4v',
    }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';

    if (range) {
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
      if (isNaN(start) || isNaN(end) || start > end || end >= fileSize) {
        return res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
      }
      const chunkSize = end - start + 1;
      res.writeHead(206, {
        ...common,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        ...common,
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (e) {
    res.status(500).json({ message: 'Stream error', error: e.message });
  }
});

module.exports = router;