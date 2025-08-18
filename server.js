// server.js
// This is the main entry point for the WeFlix API.

const express = require('express');
const sequelize = require('./db');
const Film = require('./models/film');
const Person = require('./models/person');
const Planet = require('./models/planet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- API ENDPOINTS ---

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the WeFlix API for Star Wars!');
});

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
