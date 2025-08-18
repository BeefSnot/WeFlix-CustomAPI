// db.js
// This file configures the database connection using Sequelize.

const { Sequelize } = require('sequelize');

// --- DATABASE CONFIGURATION ---
// Replace 'weflix_db' with your database name if it's different.
// Replace 'postgres' with your PostgreSQL username if it's different.
// IMPORTANT: Replace 'your_password' with your actual PostgreSQL password.

const sequelize = new Sequelize('weflix_db', 'postgres', 'Yoda', {
    host: 'localhost',
    dialect: 'postgres',
    // Optional: disable logging of SQL queries to the console
    logging: false 
});

module.exports = sequelize;
