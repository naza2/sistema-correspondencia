// ============================================
// src/config/database.js - Configuración de Sequelize
// ============================================

const { Sequelize } = require('sequelize');

let sequelize;

// Configuración SSL para producción (Render)
const sslConfig = {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Importante para Render
        }
    },
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Si existe DATABASE_URL, usarla (Render)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        ...sslConfig,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });
} else {
    // Configuración por variables individuales (desarrollo local)
    sequelize = new Sequelize(
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
}

module.exports = { sequelize };