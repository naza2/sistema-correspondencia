// ============================================
// src/controllers/areaController.js - Controlador de Áreas
// ============================================

const { Area } = require('../models');

/**
 * GET /api/areas
 * Listar todas las áreas activas
 */
const list = async (req, res) => {
    try {
        const areas = await Area.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: areas
        });
    } catch (error) {
        console.error('Error al listar áreas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al listar áreas'
        });
    }
};

/**
 * GET /api/areas/:id
 * Obtener un área por ID
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await Area.findByPk(id);

        if (!area) {
            return res.status(404).json({
                success: false,
                error: 'Área no encontrada'
            });
        }

        res.json({
            success: true,
            data: area
        });
    } catch (error) {
        console.error('Error al obtener área:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener área'
        });
    }
};

module.exports = { list, getById };