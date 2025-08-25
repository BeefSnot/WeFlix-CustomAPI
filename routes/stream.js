const express = require('express');
const path = require('path');
const Movie = require('../models/Movie');
const { verify } = require('../src/streamToken');
const router = express.Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const token = req.query.t;
  console.log(`[STREAM] Request for id=${id}, token=${token}`);
  if (!token || !verify(token, id)) {
    console.warn(`[STREAM] Invalid or missing token for id=${id}`);
    return res.status(503).json({ message: 'Video stream for this title is not available.' });
  }
  const movie = await Movie.findByPk(id);
  if (!movie || !movie.streamUrl) {
    console.warn(`[STREAM] No stream source for id=${id}`);
    return res.status(404).json({ message: 'Video stream for this title is not available.' });
  }
  const src = movie.streamUrl;
  console.log(`[STREAM] Resolved stream source for id=${id}:`, src);
  if (src.startsWith('http')) {
    return res.redirect(src);
  } else {
    // If src is not absolute, resolve relative to project root
    const absPath = path.isAbsolute(src) ? src : path.join(process.cwd(), src);
    if (!path.isAbsolute(src)) {
      console.log(`[STREAM] Resolved relative src for id=${id}: ${absPath}`);
    }
    return res.sendFile(absPath, err => {
      if (err) {
        console.error(`[STREAM] sendFile error for id=${id}:`, err);
        res.status(404).json({ message: 'Video stream for this title is not available.' });
      }
    });
  }
});

module.exports = router;