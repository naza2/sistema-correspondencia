// ============================================
// src/config/database.js - Configuración de Sequelize
// ============================================

const { Sequelize } = require('sequelize');

let sequelize;

// Función para obtener la URL con SSL
function getDatabaseUrl() {
    let url = process.env.DATABASE_URL || process.env.DB_URL;
    if (!url) {
        // Construir URL desde variables individuales
        const host = process.env.DB_HOST || 'postgres';
        const port = process.env.DB_PORT || 5432;
        const user = process.env.DB_USER || 'postgres';
        const password = process.env.DB_PASSWORD || 'postgres';
        const database = process.env.DB_NAME || 'correspondencia_db';
        url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    }
    
    // Agregar sslmode si no está presente
    if (!url.includes('sslmode')) {
        url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    
    return url;
}

// Usar la URL con SSL habilitado
const dbUrl = getDatabaseUrl();

console.log('📦 Conectando a PostgreSQL en Render...');

sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = { sequelize };