// ============================================
// src/routes/index.js - Índice de rutas
// ============================================

const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const incomingRoutes = require('./incomingRoutes');
const areaRoutes = require('./areaRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/incoming', incomingRoutes);
router.use('/areas', areaRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;