// ============================================
// src/routes/authRoutes.js - Rutas de Autenticación
// ============================================

const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

// GET /api/auth/verify - Verificar token
router.get('/verify', verify);

module.exports = router;