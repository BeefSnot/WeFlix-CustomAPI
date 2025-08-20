// seed.js
// This script connects to the database, wipes it clean, and populates it with initial data.

require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const Movie = require('./models/Movie');
const User = require('./models/User');

const seedDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced! Tables recreated.');

        // --- CREATE USERS ---
        await User.create({
            username: 'tester',
            passwordHash: await bcrypt.hash('force', 10),
            role: 'user'
        });
        await User.create({
            username: 'admin',
            passwordHash: await bcrypt.hash('adminpass', 10),
            role: 'admin'
        });
        console.log('Users created!');

        // --- CREATE MOVIES ---
        await Movie.bulkCreate([
            { 
              title: 'A New Hope', 
              year: 1977, 
              genre: 'Sci-Fi', 
              rating: 8.6, 
              description: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire\'s world-destroying battle station.',
              streamUrl: null // No URL for this one yet
            },
            { 
              title: 'Attack of the Clones', 
              year: 2002, 
              genre: 'Sci-Fi', 
              rating: 6.6, 
              description: 'Ten years after the initial invasion of Naboo, the galaxy is on the brink of civil war.',
              streamUrl: 'http://weflix.jameshamby.me/Movies/StarWarsEpisodeII.mp4' 
            },
            { 
              title: 'The Empire Strikes Back', 
              year: 1980, 
              genre: 'Sci-Fi', 
              rating: 8.8, 
              description: 'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda.',
              streamUrl: null 
            },
            { 
              title: 'Return of the Jedi', 
              year: 1983, 
              genre: 'Sci-Fi', 
              rating: 8.3, 
              description: 'After a daring mission to rescue Han Solo from Jabba the Hutt, the Rebels dispatch to Endor to destroy the second Death Star.',
              streamUrl: null
            }
        ]);
        console.log('Movies created!');

        console.log('✅ Seeding complete! 🌱');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        // Close the database connection once seeding is done.
        await sequelize.close();
        console.log('Database connection closed.');
    }
};

// Run the seeding function
seedDatabase();
