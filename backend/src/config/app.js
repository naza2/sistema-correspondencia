// ============================================
// src/config/app.js - Configuración de Express
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const routes = require('../routes');
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'correspondencia-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

module.exports = app;