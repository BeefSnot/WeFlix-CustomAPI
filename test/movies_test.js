require('dotenv').config();
const request = require('supertest');
const sequelize = require('../db');
const app = require('../server');
const Movie = require('../models/Movie');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await Movie.create({ title: 'Test Movie', year: 2024 });
  const passwordHash = await bcrypt.hash('force', 10);
  await User.create({ username: 'tester', passwordHash, role: 'user' });
});

afterAll(async () => {
  await sequelize.close();
});

test('GET /api/movies returns list', async () => {
  const res = await request(app).get('/api/movies');
  expect(res.statusCode).toBe(200);
  expect(res.body.data.length).toBeGreaterThan(0);
  expect(res.body.meta).toHaveProperty('totalPages');
});

test('POST /api/movies requires auth', async () => {
  const res = await request(app).post('/api/movies').send({ title: 'No Auth Movie' });
  expect(res.statusCode).toBe(401);
});

test('POST /api/movies with token creates movie', async () => {
  // Direct token (could also login via endpoint)
  const token = jwt.sign({ username: 'tester', role: 'user' }, process.env.JWT_SECRET || 'dev_secret');
  const res = await request(app)
    .post('/api/movies')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Auth Movie', year: 2025 });
  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('Auth Movie');
});