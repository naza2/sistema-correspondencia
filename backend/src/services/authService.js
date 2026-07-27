// ============================================
// src/services/authService.js - Servicio de Autenticación
// ============================================

const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'mi-secreto-jwt';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    /**
     * Iniciar sesión
     * @param {string} email - Correo electrónico del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} Token y datos del usuario
     */
    async login(email, password) {
        // Buscar usuario por email
        const user = await User.findOne({ 
            where: { email, isActive: true } 
        });

        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const isValid = await user.verifyPassword(password);
        if (!isValid) {
            throw new Error('Credenciales inválidas');
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            this.secret,
            { expiresIn: this.expiresIn }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        };
    }

    /**
     * Verificar token JWT
     * @param {string} token - Token JWT
     * @returns {Object|null} Datos decodificados o null
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            return null;
        }
    }
}

module.exports = { AuthService };