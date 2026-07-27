// ============================================
// src/routes/incomingRoutes.js - Rutas de Correspondencia
// ============================================

const express = require('express');
const router = express.Router();
const {
    create,
    list,
    getById,
    update,      // ← NUEVO
    distribute,
    deliver
} = require('../controllers/incomingController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /api/incoming - Registrar correspondencia
router.post('/', create);

// GET /api/incoming - Listar correspondencia
router.get('/', list);

// GET /api/incoming/:id - Obtener por ID
router.get('/:id', getById);

// PUT /api/incoming/:id - Actualizar correspondencia
router.put('/:id', update);  // ← NUEVO

// PUT /api/incoming/:id/distribute - Distribuir
router.put('/:id/distribute', distribute);

// PUT /api/incoming/:id/deliver - Entregar
router.put('/:id/deliver', deliver);

module.exports = router;