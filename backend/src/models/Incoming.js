// ============================================
// src/models/Incoming.js - Modelo de Correspondencia Entrante
// ============================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incoming = sequelize.define('Incoming', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    folio: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    senderName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'sender_name'
    },
    senderInstitution: {
        type: DataTypes.STRING(150),
        field: 'sender_institution'
    },
    senderPosition: {
        type: DataTypes.STRING(100),
        field: 'sender_position'
    },
    recipientAreaId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'recipient_area_id'
    },
    recipientName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'recipient_name'
    },
    recipientPosition: {
        type: DataTypes.STRING(100),
        field: 'recipient_position'
    },
    subject: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    urgencyLevel: {
        type: DataTypes.ENUM('URGENT', 'ORDINARY'),
        defaultValue: 'ORDINARY',
        field: 'urgency_level'
    },
    isConfidential: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_confidential'
    },
    status: {
        type: DataTypes.ENUM('REGISTERED', 'DISTRIBUTED', 'DELIVERED', 'ARCHIVED'),
        defaultValue: 'REGISTERED'
    },
    pageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: 'page_count'
    },
    observations: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    receivedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'received_at'
    },
    distributedAt: {
        type: DataTypes.DATE,
        field: 'distributed_at'
    },
    deliveredAt: {
        type: DataTypes.DATE,
        field: 'delivered_at'
    }
}, {
    tableName: 'incoming_correspondence',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================

Incoming.prototype.canDistribute = function() {
    return this.status === 'REGISTERED';
};

Incoming.prototype.canDeliver = function() {
    return this.status === 'DISTRIBUTED';
};

Incoming.prototype.distribute = function(areaId, userId) {
    if (!this.canDistribute()) {
        throw new Error('Este documento ya fue distribuido');
    }
    this.status = 'DISTRIBUTED';
    this.recipientAreaId = areaId;
    this.distributedAt = new Date();
    this.updatedBy = userId;
};

Incoming.prototype.deliver = function(userId) {
    if (!this.canDeliver()) {
        throw new Error('El documento debe estar distribuido para entregarlo');
    }
    this.status = 'DELIVERED';
    this.deliveredAt = new Date();
    this.updatedBy = userId;
};

Incoming.prototype.archive = function(userId) {
    if (this.status === 'ARCHIVED') {
        throw new Error('El documento ya está archivado');
    }
    this.status = 'ARCHIVED';
    this.updatedBy = userId;
};

Incoming.prototype.isUrgent = function() {
    return this.urgencyLevel === 'URGENT';
};

Incoming.prototype.isConfidentialDoc = function() {
    return this.isConfidential === true;
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

Incoming.generateFolio = async function() {
    const year = new Date().getFullYear();
    const { Op } = require('sequelize');
    const count = await this.count({
        where: {
            folio: { [Op.like]: `INF-${year}-%` }
        }
    });
    const nextNumber = count + 1;
    return `INF-${year}-${String(nextNumber).padStart(4, '0')}`;
};

module.exports = { Incoming };