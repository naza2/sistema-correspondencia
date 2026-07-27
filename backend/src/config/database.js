// ============================================
// src/config/database.js - Configuración de Sequelize
// ============================================

const { Sequelize } = require('sequelize');

// Configuración para desarrollo
const sequelize = new Sequelize(
    process.env.DB_NAME || 'correspondencia_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'postgres',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = { sequelize };