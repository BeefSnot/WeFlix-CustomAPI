// server.js
// Main entry point for the WeFlix API and Frontend Server.

const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./db');

// Routers
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
const showsRouter = require('./routes/shows'); // add
// Custom middleware
const requestLogger = require('./src/middleware/logger');
// Swagger (auto-generated API docs)
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const apicache = require('apicache');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // listen on all interfaces
app.set('trust proxy', 1);

// --- CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Serve static files from the project's root directory
app.use(express.static(__dirname));

// -------- Swagger Setup --------
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'WeFlix API', version: '1.0.0', description: 'Movies API with pagination & auth (extensible).' },
        servers: [
          { url: 'https://weflix.jameshamby.me', description: 'Prod' },
          { url: `http://${HOST}:${PORT}`, description: 'Local' }
        ],
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
          },
          schemas: {
            Movie: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                title: { type: 'string', example: 'Inception' },
                description: { type: 'string' },
                year: { type: 'integer', example: 2010 }
              },
              additionalProperties: true
            },
            MoviePage: {
              type: 'object',
              properties: {
                data: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
                meta: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    pageSize: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 123 },
                    totalPages: { type: 'integer', example: 13 }
                  }
                }
              }
            },
            ShowItem: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['dir', 'file'] },
                name: { type: 'string' },
                path: { type: 'string' },
                size: { type: 'integer', nullable: true },
                mtime: { type: 'number', nullable: true }
              }
            },
            ShowList: {
              type: 'object',
              properties: {
                dir: { type: 'string' },
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                items: { type: 'array', items: { $ref: '#/components/schemas/ShowItem' } }
              }
            },
            AuthLoginRequest: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
              }
            },
            AuthRegisterRequest: {
              type: 'object',
              required: ['username', 'email', 'password'],
              properties: {
                username: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
              }
            },
            AuthResponse: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object', additionalProperties: true }
              }
            }
          }
        }
    },
    apis: ['./server.js', './routes/*.js', './docs/*.js'] // <— include docs folder
});
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function cacheGet(ttlSeconds) {
  const store = new Map();
  return (req, res, next) => {
    if (req.method !== 'GET') return next();
    const key = req.originalUrl;
    const hit = store.get(key);
    const now = Date.now();
    if (hit && hit.expires > now) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Remaining', String(Math.max(0, Math.round((hit.expires - now) / 1000))));
      return res.json(hit.data);
    }
    const send = res.json.bind(res);
    res.json = (body) => {
      const expires = Date.now() + ttlSeconds * 1000;
      store.set(key, { data: body, expires });
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Remaining', String(ttlSeconds));
      return send(body);
    };
    next();
  };
}

// --- API ROUTERS ---
app.use('/api/auth', authRouter);
app.use('/api/movies', cacheGet(300), moviesRouter);
app.use('/api/shows', cacheGet(300), showsRouter); // add

// --- FRONTEND ROUTE ---
// All other GET requests not handled by the API will serve the main index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- SERVER INITIALIZATION ---
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        app.listen(PORT, HOST, () => {
            console.log(`🚀 API listening on ${HOST}:${PORT} (proxied at https://weflix.jameshamby.me/api)`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
