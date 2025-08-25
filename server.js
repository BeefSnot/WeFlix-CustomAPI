// server.js
// Main entry point for the WeFlix API and Frontend Server.

const express = require('express');
const path = require('path');
const cors = require('cors');
const sequelize = require('./db');

// Routers
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
const showsRouter = require('./routes/shows');
const streamRouter = require('./routes/stream'); // add
// Make adminUsers optional
let adminUsersRouter;
try { adminUsersRouter = require('./routes/adminUsers'); } catch { adminUsersRouter = null; }
const adminStreamsRouter = require('./routes/adminStreams');
const adminSeedsRouter = require('./routes/adminSeeds');
// Custom middleware
const requestLogger = require('./src/middleware/logger');
const cache = require('./src/middleware/cache');
// Swagger (auto-generated API docs)
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const apicache = require('apicache');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // listen on all interfaces
app.set('trust proxy', 1);

// --- CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser()); // <-- add

// Gate admin.html BEFORE static
app.get('/admin.html', (req, res) => {
  const token =
    (req.cookies && req.cookies.jwt) ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);
  try {
    if (!token) throw new Error('no token');
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (payload.role !== 'admin') throw new Error('not admin');
    return res.sendFile(path.join(__dirname, 'admin.html'));
  } catch {
    return res.redirect('/login.html');
  }
});

// Serve static files from the project's root directory
app.use(express.static(__dirname));

// -------- Swagger Setup --------
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'WeFlix API', version: '1.0.0', description: 'Movies API with pagination & auth (extensible).' },
        servers: [
            { url: 'https://weflix.media', description: 'Prod' },
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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: { persistAuthorization: true }
}));

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
app.use('/api/movies', cache(parseInt(process.env.CACHE_TTL_SECONDS || '60', 10)), moviesRouter);
app.use('/api/shows',  cache(parseInt(process.env.SHOWS_CACHE_TTL || '300', 10)), showsRouter);
app.use('/api/stream', streamRouter);
app.use('/api/admin/streams', adminStreamsRouter);
app.use('/api/admin/seeds', adminSeedsRouter);
if (adminUsersRouter) app.use('/api/admin/users', adminUsersRouter); // optional

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
            console.log(`🚀 API listening on ${HOST}:${PORT} (proxied at https://weflix.media/api)`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
