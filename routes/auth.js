const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../src/middleware/auth');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register and receive JWT
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });
    if (String(username).length < 3) return res.status(400).json({ message: 'Username too short' });
    if (String(password).length < 6) return res.status(400).json({ message: 'Password too short' });
    const exists = await User.findOne({ where: { username } });
    if (exists) return res.status(409).json({ message: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash, role: 'user' });
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user from JWT
 */
router.get('/me', auth(), async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;