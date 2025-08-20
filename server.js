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

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

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

// --- FRONTEND ROUTE ---
// All other GET requests not handled by the API will serve the frontend app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});


// --- SERVER INITIALIZATION ---
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
