// ============================================
// src/routes/dashboardRoutes.js - Rutas del Dashboard
// ============================================

const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/dashboard/stats - Obtener estadísticas
router.get('/stats', getStats);

module.exports = router;