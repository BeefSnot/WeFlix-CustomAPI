// models/person.js
// Defines the 'Person' model (for characters) and its relationship to Planets.

const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Planet = require('./planet');

const Person = sequelize.define('Person', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

// --- MODEL ASSOCIATIONS ---
// This sets up the foreign key relationship.
// A Person belongs to one Planet (their homeworld).
// This will add a 'homeworldId' column to the 'People' table.
Person.belongsTo(Planet, { as: 'homeworld', foreignKey: 'homeworldId' });
Planet.hasMany(Person, { foreignKey: 'homeworldId' }); // A Planet can have many people

module.exports = Person;
