// ============================================
// src/models/User.js - Modelo de Usuario
// ============================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
    },
    firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'first_name'
    },
    lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'last_name'
    },
    role: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'viewer',
        validate: {
            isIn: [['admin', 'operator', 'manager', 'messenger', 'viewer']]
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================

// Verificar contraseña
User.prototype.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.passwordHash);
};

// Obtener nombre completo
User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// ============================================
// HOOKS - Hash de contraseña
// ============================================

User.beforeCreate(async (user) => {
    if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
    }
});

module.exports = { User };