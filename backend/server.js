// ============================================
// server.js - Punto de entrada del Backend
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middlewares
// ============================================

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'correspondencia-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Iniciar Servidor
// ============================================

app.listen(PORT, () => {
    console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
    console.log(`📚 Health Check: http://localhost:${PORT}/health`);
});