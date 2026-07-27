'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // ============================================
        // 1. CREAR TABLA DE CORRESPONDENCIA ENTRANTE
        // ============================================
        
        await queryInterface.createTable('incoming_correspondence', {
            // ID - Identificador único
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },

            // FOLIO - Número de control
            folio: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },

            // DATOS DEL REMITENTE
            sender_name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            sender_institution: {
                type: Sequelize.STRING(150)
            },
            sender_position: {
                type: Sequelize.STRING(100)
            },

            // DATOS DEL DESTINATARIO
            recipient_area_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'areas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            recipient_name: {
                type: Sequelize.STRING(150),
                allowNull: false
            },
            recipient_position: {
                type: Sequelize.STRING(100)
            },

            // DATOS DEL DOCUMENTO
            subject: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            urgency_level: {
                type: Sequelize.ENUM('URGENT', 'ORDINARY'),
                defaultValue: 'ORDINARY'
            },
            is_confidential: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: Sequelize.ENUM('REGISTERED', 'DISTRIBUTED', 'DELIVERED', 'ARCHIVED'),
                defaultValue: 'REGISTERED'
            },
            page_count: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            observations: {
                type: Sequelize.TEXT
            },
            metadata: {
                type: Sequelize.JSONB,
                defaultValue: {}
            },

            // FECHAS
            received_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            distributed_at: {
                type: Sequelize.DATE
            },
            delivered_at: {
                type: Sequelize.DATE
            },

            // TIMESTAMPS
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },

            // USUARIOS
            created_by: {
                type: Sequelize.UUID,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            updated_by: {
                type: Sequelize.UUID,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            }
        });

        // ============================================
        // 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
        // ============================================

        // Índice para búsqueda por folio
        await queryInterface.addIndex('incoming_correspondence', ['folio']);

        // Índice para búsqueda por estado
        await queryInterface.addIndex('incoming_correspondence', ['status']);

        // Índice para búsqueda por área
        await queryInterface.addIndex('incoming_correspondence', ['recipient_area_id']);

        // Índice para ordenar por fecha
        await queryInterface.addIndex('incoming_correspondence', ['received_at']);

        // Índice para búsqueda por urgencia
        await queryInterface.addIndex('incoming_correspondence', ['urgency_level']);

        // Índice para búsqueda por usuario creador
        await queryInterface.addIndex('incoming_correspondence', ['created_by']);

        // Índice compuesto para consultas frecuentes
        await queryInterface.addIndex('incoming_correspondence', ['status', 'received_at']);
    },

    // ============================================
    // DOWN - Revertir la migración
    // ============================================
    
    down: async (queryInterface) => {
        // Eliminar la tabla
        await queryInterface.dropTable('incoming_correspondence');
    }
};