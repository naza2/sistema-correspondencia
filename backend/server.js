// ============================================
// server.js - Punto de entrada del Backend
// ============================================

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'correspondencia-backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
    console.log(`📚 Health Check: http://localhost:${PORT}/health`);
});