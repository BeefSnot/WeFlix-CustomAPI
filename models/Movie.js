const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Movie = sequelize.define('Movie', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER },
  genre: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  rating: { type: DataTypes.DECIMAL(3,1) },
  streamUrl: { type: DataTypes.STRING } // New field for the movie URL
}, {
  tableName: 'movies',
  timestamps: true
});

module.exports = Movie;
