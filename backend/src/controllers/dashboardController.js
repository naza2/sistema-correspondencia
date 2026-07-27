// ============================================
// src/controllers/dashboardController.js - Controlador de Dashboard
// ============================================

const { Incoming, Area } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * GET /api/dashboard/stats
 * Obtener estadísticas del dashboard
 */
const getStats = async (req, res) => {
    try {
        // 1. Total de documentos
        const total = await Incoming.count();

        // 2. Documentos por estado
        const byStatus = {
            REGISTERED: await Incoming.count({ where: { status: 'REGISTERED' } }),
            DISTRIBUTED: await Incoming.count({ where: { status: 'DISTRIBUTED' } }),
            DELIVERED: await Incoming.count({ where: { status: 'DELIVERED' } }),
            ARCHIVED: await Incoming.count({ where: { status: 'ARCHIVED' } })
        };

        // 3. Documentos urgentes
        const urgent = await Incoming.count({ 
            where: { urgencyLevel: 'URGENT' } 
        });

        // 4. Documentos confidenciales
        const confidential = await Incoming.count({ 
            where: { isConfidential: true } 
        });

        // 5. Documentos de hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCount = await Incoming.count({
            where: {
                receivedAt: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            }
        });

        // 6. Documentos por área (opcional)
        let byArea = [];
        try {
            const byAreaResults = await Incoming.findAll({
                attributes: [
                    'recipient_area_id',
                    [sequelize.fn('COUNT', sequelize.col('incoming_correspondence.id')), 'count']
                ],
                group: ['recipient_area_id'],
                include: [
                    {
                        model: Area,
                        as: 'recipientArea',
                        attributes: ['name']
                    }
                ],
                raw: true,
                nest: true
            });

            byArea = byAreaResults.map(item => ({
                area: item.recipientArea?.name || 'Sin área',
                count: parseInt(item.count, 10)
            }));
        } catch (areaError) {
            console.error('Error al obtener documentos por área:', areaError);
            byArea = [];
        }

        res.json({
            success: true,
            data: {
                total,
                byStatus,
                urgent,
                confidential,
                today: todayCount,
                byArea
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};

module.exports = { getStats };