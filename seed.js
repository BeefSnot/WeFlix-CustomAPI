// seed.js
// Connects to the DB, recreates tables, seeds users and movies.
// Real stream sources are kept server-side only and stored via streamsStore.

require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const Movie = require('./models/Movie');
const User = require('./models/User');
const { setAll } = require('./src/streamsStore'); // writes data/streams.json

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
    // Keep real stream source only in _src (not saved to DB)
    const seeds = [
      {
        title: 'The Phantom Menace',
        year: 1999,
        genre: 'Sci-Fi',
        rating: 6.5,
        description: 'Two Jedi escape a hostile blockade to find allies and come across a young boy who may bring balance to the Force, but the long dormant Sith resurface to claim their original glory.',
        _src: 'https://weflix.media/Movies/StarWarsEpisodeI.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYTRhNjcwNWQtMGJmMi00NmQyLWE2YzItODVmMTdjNWI0ZDA2XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Star_Wars_Episode_I_The_Phantom_Menace_logo.svg'
      },
      {
        title: 'Attack of the Clones',
        year: 2002,
        genre: 'Sci-Fi',
        rating: 6.6,
        description: 'Ten years after the initial invasion of Naboo, the galaxy is on the brink of civil war. Under the leadership of a renegade Jedi named Count Dooku, thousands of solar systems threaten to secede from the Galactic Republic.',
        _src: 'https://weflix.media/Movies/StarWarsEpisodeII.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDAzM2M0Y2UtZjRmZi00MzVlLTg4MjEtOTE3NzU5ZDVlMTU5XkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Star_Wars_Attack_of_the_Clones_logo.svg/1280px-Star_Wars_Attack_of_the_Clones_logo.svg.png'
      },
      {
        title: 'A New Hope',
        year: 1977,
        genre: 'Sci-Fi',
        rating: 8.6,
        description: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire\'s world-destroying battle station.',
        _src: 'https://weflix.media/Movies/StarWarsEpisodeIV.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTA5NjhiOTAtZWM0ZC00MWNhLThiM2YtNDI5ZGJiOTNiM2M4XkEyXkFqcGdeQXVyMTA4NDI1NTQx._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Star_Wars_Logo.svg/1280px-Star_Wars_Logo.svg.png'
      },
      {
        title: 'The Empire Strikes Back',
        year: 1980,
        genre: 'Sci-Fi',
        rating: 8.8,
        description: 'After the Rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda.',
        _src: 'https://weflix.media/Movies/Star_Wars_The_Empire_Strikes_Back_logo.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BYmU1NDRjNDgtMzhiMi00NjZmLTg5NGItZDNiZjU5NTU4OTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Star_Wars_The_Empire_Strikes_Back_logo.svg/1280px-Star_Wars_The_Empire_Strikes_Back_logo.svg.png'
      },
      {
        title: 'Return of the Jedi',
        year: 1983,
        genre: 'Sci-Fi',
        rating: 8.3,
        description: 'After a daring mission to rescue Han Solo from Jabba the Hutt, the Rebels dispatch to Endor to destroy the second Death Star.',
        _src: 'https://weflix.media/Movies/StarWarsEpisodeVI.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BOWZlMjFiYzgtMTUzNC00Y2IzLTk1NTMtZmNhMTczNTk0ODk1XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Star_Wars_Return_of_the_Jedi_logo.svg/1280px-Star_Wars_Return_of_the_Jedi_logo.svg.png'
      },
      {
        title: 'Joker',
        year: 2019,
        genre: 'Drama, Thriller',
        rating: 8.4,
        description: 'In 1980s Gotham City, a mentally troubled comedian, Arthur Fleck, is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
        _src: 'https://weflix.media/Movies/Joker.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGVjNWI4ZGUtNzE0MS00YTJmLWI0ZDctN2ZiYTk2YmI3NTYyXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Joker_%282019_film%29_logo.svg'
      },
      {
        title: 'Wicked',
        year: 2024,
        genre: 'Fantasy, Musical',
        rating: null,
        description: 'Elphaba, a young woman, is misunderstood because of her unusual green skin. After meeting Glinda, a popular young woman, their friendship struggles as they see the world from opposite perspectives.',
        _src: 'https://weflix.media/Movies/Wicked.mp4',
        posterUrl: 'https://m.media-amazon.com/images/M/MV5BZjQwNmQ2OTYtM2E3NS00M2I1LWE5OTItY2E3N2I0ZDRiMzg5XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',
        titleImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Wicked_Movie_Logo.svg/1280px-Wicked_Movie_Logo.svg.png'
      }
    ];

    // Insert movies without streamUrl (keep _src private)
    await Movie.bulkCreate(seeds.map(({ _src, ...rest }) => rest));
    console.log('Movies created!');

    // Build id → source map (server-only)
    const movies = await Movie.findAll({ attributes: ['id', 'title'] });
    const srcByTitle = Object.fromEntries(seeds.map(s => [s.title, s._src]));
    const map = {};
    for (const m of movies) {
      const src = srcByTitle[m.title];
      if (src) map[m.id] = src;
    }
    setAll(map);
    console.log('Stream map saved for', Object.keys(map).length, 'movies');

    console.log('✅ Seeding complete! 🌱');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

seedDatabase();