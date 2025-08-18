// models/planet.js
// Defines the 'Planet' model.

const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Planet = sequelize.define('Planet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false
});

module.exports = Planet;
