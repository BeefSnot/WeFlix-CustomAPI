const express = require('express');
const Movie = require('../models/Movie');
const cache = require('../src/middleware/cache');
const auth = require('../src/middleware/auth');
const router = express.Router();

/**
 * @openapi
 * /api/movies:
 *   get:
 *     summary: List movies (paginated)
 */
router.get('/', cache(parseInt(process.env.CACHE_TTL_SECONDS) || 30), async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;
  const { rows, count } = await Movie.findAndCountAll({ limit, offset, order: [['id', 'ASC']] });
  res.json({
    data: rows,
    meta: { page, pageSize: limit, total: count, totalPages: Math.ceil(count / limit) }
  });
});

/**
 * @openapi
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by id
 */
router.get('/:id', async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ message: 'Not found' });
  res.json(movie);
});

/**
 * @openapi
 * /api/movies:
 *   post:
 *     summary: Create a movie (auth)
 */
router.post('/', auth('user'), async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (e) {
    res.status(400).json({ message: 'Invalid movie data' });
  }
});

/**
 * @openapi
 * /api/movies/{id}:
 *   put:
 *     summary: Update a movie (auth)
 */
router.put('/:id', auth('user'), async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ message: 'Not found' });
  await movie.update(req.body);
  res.json(movie);
});

/**
 * @openapi
 * /api/movies/{id}:
 *   delete:
 *     summary: Delete a movie (admin)
 */
router.delete('/:id', auth('admin'), async (req, res) => {
  const movie = await Movie.findByPk(req.params.id);
  if (!movie) return res.status(404).json({ message: 'Not found' });
  await movie.destroy();
  res.status(204).end();
});

module.exports = router;