'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Crear tabla de áreas
        await queryInterface.createTable('areas', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // 2. Crear tabla de usuarios
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            first_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            role: {
                type: Sequelize.STRING(30),
                allowNull: false,
                defaultValue: 'viewer'
            },
            area_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'areas',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // 3. Insertar áreas por defecto
        await queryInterface.bulkInsert('areas', [
            {
                id: '11111111-1111-1111-1111-111111111111',
                code: 'DGA',
                name: 'Dirección General',
                description: 'Dirección General del Instituto',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                code: 'DAJ',
                name: 'Dirección de Asuntos Jurídicos',
                description: 'Área de asuntos legales y jurídicos',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: '33333333-3333-3333-3333-333333333333',
                code: 'DAF',
                name: 'Dirección de Administración y Finanzas',
                description: 'Área administrativa y financiera',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);

        // 4. Insertar usuario admin por defecto
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await queryInterface.bulkInsert('users', [
            {
                id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                username: 'admin',
                email: 'admin@infodf.gob.mx',
                password_hash: hashedPassword,
                first_name: 'Administrador',
                last_name: 'Sistema',
                role: 'admin',
                area_id: '11111111-1111-1111-1111-111111111111',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('users');
        await queryInterface.dropTable('areas');
    }
};