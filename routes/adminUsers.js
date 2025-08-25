const express = require('express');
const User = require('../models/User');
const auth = require('../src/middleware/auth');

const router = express.Router();
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
}

// List users (no passwordHash)
router.get('/', auth(), requireAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'] });
  res.json({ data: users });
});

module.exports = router;