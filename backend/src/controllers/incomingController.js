// ============================================
// src/controllers/incomingController.js - Controlador de Correspondencia
// ============================================

const { IncomingService } = require('../services/incomingService');

const incomingService = new IncomingService();

/**
 * POST /api/incoming
 * Registrar nueva correspondencia
 */
const create = async (req, res) => {
    try {
        const userId = req.user?.id;
        const data = req.body;

        // Validar campos requeridos
        const required = ['senderName', 'subject', 'recipientName', 'recipientAreaId'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Campos obligatorios: ${missing.join(', ')}`
            });
        }

        // Validar que el área existe
        const { Area } = require('../models');
        const area = await Area.findByPk(data.recipientAreaId);
        if (!area) {
            return res.status(400).json({
                success: false,
                error: 'El área destino no existe'
            });
        }

        // Registrar la correspondencia
        const incoming = await incomingService.create(data, userId);

        // Obtener el documento completo con relaciones
        const result = await incomingService.findById(incoming.id);

        res.status(201).json({
            success: true,
            data: result,
            message: `Correspondencia registrada con éxito. Folio: ${incoming.folio}`
        });
    } catch (error) {
        console.error('Error al registrar correspondencia:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al registrar correspondencia'
        });
    }
};

/**
 * GET /api/incoming
 * Listar toda la correspondencia
 */
const list = async (req, res) => {
    try {
        const incoming = await incomingService.findAll();
        res.json({
            success: true,
            data: incoming
        });
    } catch (error) {
        console.error('Error al listar correspondencia:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al listar correspondencia'
        });
    }
};

/**
 * GET /api/incoming/:id
 * Obtener correspondencia por ID
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const incoming = await incomingService.findById(id);

        if (!incoming) {
            return res.status(404).json({
                success: false,
                error: 'Documento no encontrado'
            });
        }

        res.json({
            success: true,
            data: incoming
        });
    } catch (error) {
        console.error('Error al obtener correspondencia:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener correspondencia'
        });
    }
};

/**
 * PUT /api/incoming/:id
 * Actualizar correspondencia existente
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const data = req.body;

        // Validar campos requeridos
        const required = ['senderName', 'subject', 'recipientName', 'recipientAreaId'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Campos obligatorios: ${missing.join(', ')}`
            });
        }

        // Validar que el área existe
        const { Area } = require('../models');
        const area = await Area.findByPk(data.recipientAreaId);
        if (!area) {
            return res.status(400).json({
                success: false,
                error: 'El área destino no existe'
            });
        }

        // Actualizar la correspondencia
        const incoming = await incomingService.update(id, data, userId);

        // Obtener el documento actualizado con relaciones
        const result = await incomingService.findById(id);

        res.json({
            success: true,
            data: result,
            message: `Correspondencia ${result.folio} actualizada con éxito`
        });
    } catch (error) {
        console.error('Error al actualizar correspondencia:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al actualizar correspondencia'
        });
    }
};

/**
 * PUT /api/incoming/:id/distribute
 * Distribuir documento
 */
const distribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { areaId } = req.body;
        const userId = req.user?.id;

        if (!areaId) {
            return res.status(400).json({
                success: false,
                error: 'El área destino es requerida'
            });
        }

        const incoming = await incomingService.updateStatus(id, 'DISTRIBUTED', userId);

        res.json({
            success: true,
            data: incoming,
            message: 'Documento distribuido con éxito'
        });
    } catch (error) {
        console.error('Error al distribuir documento:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al distribuir documento'
        });
    }
};

/**
 * PUT /api/incoming/:id/deliver
 * Entregar documento
 */
const deliver = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const incoming = await incomingService.updateStatus(id, 'DELIVERED', userId);

        res.json({
            success: true,
            data: incoming,
            message: 'Documento entregado con éxito'
        });
    } catch (error) {
        console.error('Error al entregar documento:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Error al entregar documento'
        });
    }
};

module.exports = {
    create,
    list,
    getById,
    update,      // ← NUEVO
    distribute,
    deliver
};