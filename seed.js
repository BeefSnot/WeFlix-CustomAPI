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
              title: 'The Phantom Menace',
              year: 1999,
              genre: 'Sci-Fi',
              rating: 6.5,
              description: 'Two Jedi escape a hostile blockade to find allies and come across a young boy who may bring balance to the Force, but the long dormant Sith resurface to claim their original glory.',
              streamUrl: 'https://weflix.jameshamby.me/Movies/StarWarsEpisodeI.mp4',
              posterUrl: 'https://m.media-amazon.com/images/M/MV5BYTRhNjcwNWQtMGJmMi00NmQyLWE2YzItODVmMTdjNWI0ZDA2XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg',
              titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Star_Wars_Episode_I_The_Phantom_Menace_logo.svg'
            },
            {
              title: 'Attack of the Clones',
              year: 2002,
              genre: 'Sci-Fi',
              rating: 6.6,
              description: 'Ten years after the initial invasion of Naboo, the galaxy is on the brink of civil war. Under the leadership of a renegade Jedi named Count Dooku, thousands of solar systems threaten to secede from the Galactic Republic.',
              streamUrl: 'http://weflix.jameshamby.me/Movies/StarWarsEpisodeII.mp4',
              posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDAzM2M0Y2UtZjRmZi00MzVlLTg4MjEtOTE3NzU5ZDVlMTU5XkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_SX300.jpg',
              titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Star_Wars_Attack_of_the_Clones_logo.svg/1280px-Star_Wars_Attack_of_the_Clones_logo.svg.png'
            },
            {
              title: 'A New Hope',
              year: 1977,
              genre: 'Sci-Fi',
              rating: 8.6,
              description: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire\'s world-destroying battle station.',
              streamUrl: null,
              posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTA5NjhiOTAtZWM0ZC00MWNhLThiM2YtNDI5ZGJiOTNiM2M4XkEyXkFqcGdeQXVyMTA4NDI1NTQx._V1_SX300.jpg',
              titleImageUrl: `https://placehold.co/300x100/000000/FFFFFF?text=A+New+Hope&font=orbitron`
            },
            {
              title: 'The Empire Strikes Back',
              year: 1980,
              genre: 'Sci-Fi',
              rating: 8.8,
              description: 'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda.',
              streamUrl: null,
              posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
              titleImageUrl: `https://placehold.co/300x100/000000/FFFFFF?text=The+Empire+Strikes+Back&font=orbitron`
            }
        ]);
        console.log('Movies created!');

        console.log('✅ Seeding complete! 🌱');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
};

seedDatabase();
