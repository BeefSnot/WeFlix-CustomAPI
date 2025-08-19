// db.js
// This file configures the database connection using Sequelize.

require('dotenv').config();
const { Sequelize } = require('sequelize');

// --- DATABASE CONFIGURATION ---
// Replace 'weflix_db' with your database name if it's different.
// Replace 'postgres' with your PostgreSQL username if it's different.
// IMPORTANT: Replace 'your_password' with your actual PostgreSQL password.

const {
  DB_HOST = '23.150.24.23',
  DB_PORT = 5432,
  DB_NAME = 'weflix',
  DB_USER = 'weflix',
  DB_PASS = 'dOwJ2QmiHd8y00'
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  // Optional: disable logging of SQL queries to the console
  logging: false 
});

module.exports = sequelize;
