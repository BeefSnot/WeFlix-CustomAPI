// models/film.js
// Defines the 'Film' model, representing the 'films' table in the database.

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Film = sequelize.define('Film', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    episode_id: {
        type: DataTypes.INTEGER
    },
    director: {
        type: DataTypes.STRING
    },
    release_date: {
        type: DataTypes.DATEONLY // Stores date as 'YYYY-MM-DD'
    }
}, {
    // Optional: Disable the default 'createdAt' and 'updatedAt' fields
    timestamps: false
});

module.exports = Film;
