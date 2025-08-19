// server.js
// Main entry point for the WeFlix API.

const express = require('express');
const sequelize = require('./db');
const Film = require('./models/film');
const Person = require('./models/person');
const Planet = require('./models/planet');
// Swagger (auto-generated API docs)
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// -------- Swagger Setup --------
// Only initialize once; ensures /api/docs serves interactive UI.
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'WeFlix API', version: '1.0.0', description: 'Movies API with pagination & auth (extensible).' }
    },
    // We could later move endpoint JSDoc annotations into separate route files.
    apis: [__filename] // parse this file for @openapi blocks
});
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('Swagger docs mounted at /api/docs');

// --- API ENDPOINTS ---

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the WeFlix API for Star Wars!');
});

/**
 * @openapi
 * /api/films:
 *   get:
 *     summary: List all films
 *     tags: [Films]
 *     responses:
 *       200:
 *         description: Array of film objects
 */
// GET all films
app.get('/api/films', async (req, res) => {
    try {
        const films = await Film.findAll();
        res.json(films);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving films' });
    }
});

/**
 * @openapi
 * /api/people:
 *   get:
 *     summary: List all people with their homeworld
 *     tags: [People]
 *     responses:
 *       200:
 *         description: Array of people
 */
// GET all people
app.get('/api/people', async (req, res) => {
    try {
        // Use 'include' to perform a JOIN and fetch the associated Planet data
        const people = await Person.findAll({
            include: {
                model: Planet,
                as: 'homeworld', // This alias must match the one in the model definition
                attributes: ['name'] // Only include the planet's name
            }
        });
        res.json(people);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving people' });
    }
});

// --- SERVER INITIALIZATION ---
const startServer = async () => {
    try {
        // Test the database connection
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
