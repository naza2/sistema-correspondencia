// ============================================
// src/services/incomingService.js - Servicio de Correspondencia
// ============================================

const { Incoming, Area, User } = require('../models');
const { Op } = require('sequelize');

class IncomingService {
    /**
     * Generar folio automático
     * @returns {Promise<string>} Folio generado
     */
    async generateFolio() {
        const year = new Date().getFullYear();
        const count = await Incoming.count({
            where: {
                folio: { [Op.like]: `INF-${year}-%` }
            }
        });
        const nextNumber = count + 1;
        return `INF-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    /**
     * Registrar nueva correspondencia
     * @param {Object} data - Datos de la correspondencia
     * @param {string} userId - ID del usuario que registra
     * @returns {Promise<Object>} Documento registrado
     */
    async create(data, userId) {
        // Validar campos requeridos
        const required = ['senderName', 'subject', 'recipientName', 'recipientAreaId'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Campos obligatorios: ${missing.join(', ')}`);
        }

        // Generar folio automático
        const folio = await this.generateFolio();

        // Crear el registro
        const incoming = await Incoming.create({
            ...data,
            folio,
            created_by: userId,
            updated_by: userId,
            received_at: new Date()
        });

        return incoming;
    }

    /**
     * Listar toda la correspondencia
     * @returns {Promise<Array>} Lista de documentos
     */
    async findAll() {
        return await Incoming.findAll({
            include: [
                { model: Area, as: 'recipientArea' },
                { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName', 'email'] }
            ],
            order: [['receivedAt', 'DESC']]
        });
    }

    /**
     * Buscar por ID
     * @param {string} id - ID del documento
     * @returns {Promise<Object>} Documento encontrado
     */
    async findById(id) {
        return await Incoming.findByPk(id, {
            include: [
                { model: Area, as: 'recipientArea' },
                { model: User, as: 'createdBy' }
            ]
        });
    }

    /**
     * Actualizar estado del documento
     * @param {string} id - ID del documento
     * @param {string} status - Nuevo estado
     * @param {string} userId - ID del usuario que actualiza
     * @returns {Promise<Object>} Documento actualizado
     */
    async updateStatus(id, status, userId) {
        const incoming = await Incoming.findByPk(id);
        if (!incoming) {
            throw new Error('Documento no encontrado');
        }

        // Validar transición de estado
        if (status === 'DISTRIBUTED' && incoming.status !== 'REGISTERED') {
            throw new Error('Solo se pueden distribuir documentos registrados');
        }
        if (status === 'DELIVERED' && incoming.status !== 'DISTRIBUTED') {
            throw new Error('Solo se pueden entregar documentos distribuidos');
        }

        incoming.status = status;
        incoming.updated_by = userId;
        
        if (status === 'DISTRIBUTED') {
            incoming.distributedAt = new Date();
        }
        if (status === 'DELIVERED') {
            incoming.deliveredAt = new Date();
        }
        
        await incoming.save();
        return incoming;
    }

    async update(id, data, userId) {
        const incoming = await Incoming.findByPk(id);
        if (!incoming) {
            throw new Error('Documento no encontrado');
        }

        const required = ['senderName', 'subject', 'recipientName', 'recipientAreaId'];
        const missing = required.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Campos obligatorios: ${missing.join(', ')}`);
        }

        const area = await Area.findByPk(data.recipientAreaId);
        if (!area) {
            throw new Error('El área destino no existe');
        }

        incoming.senderName = data.senderName;
        incoming.senderInstitution = data.senderInstitution;
        incoming.senderPosition = data.senderPosition;
        incoming.recipientAreaId = data.recipientAreaId;
        incoming.recipientName = data.recipientName;
        incoming.recipientPosition = data.recipientPosition;
        incoming.subject = data.subject;
        incoming.urgencyLevel = data.urgencyLevel;
        incoming.isConfidential = data.isConfidential;
        incoming.pageCount = data.pageCount;
        incoming.observations = data.observations;
        incoming.updated_by = userId;

        await incoming.save();
        return incoming;
    }
}

module.exports = { IncomingService };