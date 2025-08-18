// seed.js
// This script connects to the database, wipes it clean, and populates it with initial data.

const sequelize = require('./db');
const Film = require('./models/film');
const Person = require('./models/person');
const Planet = require('./models/planet');

const seedDatabase = async () => {
    try {
        // The { force: true } option will drop all tables and recreate them.
        // This is useful for development to ensure a clean slate.
        await sequelize.sync({ force: true });
        console.log('Database synced! Tables recreated.');

        // --- CREATE PLANETS ---
        const tatooine = await Planet.create({ name: 'Tatooine' });
        const stewjon = await Planet.create({ name: 'Stewjon' });
        const naboo = await Planet.create({ name: 'Naboo' });
        console.log('🪐 Planets created!');

        // --- CREATE PEOPLE (CHARACTERS) ---
        await Person.create({ name: 'Anakin Skywalker', homeworldId: tatooine.id });
        await Person.create({ name: 'Obi-Wan Kenobi', homeworldId: stewjon.id });
        await Person.create({ name: 'Padmé Amidala', homeworldId: naboo.id });
        await Person.create({ name: 'Palpatine', homeworldId: naboo.id });
        await Person.create({ name: 'Yoda' }); // Homeworld is unknown, so homeworldId will be null
        console.log('🧑‍🚀 People (characters) created!');

        // --- CREATE FILM ---
        await Film.create({
            title: 'Revenge of the Sith',
            episode_id: 3,
            director: 'George Lucas',
            release_date: '2005-05-19'
        });
        console.log('🎬 Film created!');

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
