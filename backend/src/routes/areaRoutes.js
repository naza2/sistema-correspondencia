// ============================================
// src/routes/areaRoutes.js - Rutas de Áreas
// ============================================

const express = require('express');
const router = express.Router();
const { list, getById } = require('../controllers/areaController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/areas - Listar áreas
router.get('/', list);

// GET /api/areas/:id - Obtener área por ID
router.get('/:id', getById);

module.exports = router;