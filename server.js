// server.js
// Main entry point for the WeFlix API and Frontend Server.

const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS
const sequelize = require('./db');

// Routers
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
// Custom middleware
const requestLogger = require('./src/middleware/logger');
// Swagger (auto-generated API docs)
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORE MIDDLEWARE ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use(requestLogger); // Custom request logger

// -------- Swagger Setup --------
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'WeFlix API', version: '1.0.0', description: 'Movies API with pagination & auth (extensible).' },
        // ... (rest of your swagger config is fine)
    },
    apis: ['./server.js', './routes/*.js']
});
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API ROUTERS ---
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);

// Health FIRST (move above any catch-all)
app.get('/__health', (req, res) => res.json({ ok: true }));

// Optional: later add frontend catch-all; TEMP remove to keep API simple
// app.get('*', (...));

// DB init (define BEFORE usage)
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('[WeFlix] DB connected');
  } catch (e) {
    console.error('[WeFlix] DB connect failed', e);
  }
}

// Export app
module.exports = app;

// Local dev (only when run directly and not under Unit)
if (require.main === module && !process.env.UNIT) {
  (async () => {
    await initDatabase();
    app.listen(PORT, () => console.log(`[WeFlix] Dev listening http://localhost:${PORT}`));
  })();
}

// NGINX Unit (UNIT=1): just init DB (Unit binds the socket)
if (process.env.UNIT) {
  initDatabase();
}
