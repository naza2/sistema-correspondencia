// ============================================
// src/middleware/auth.js - Middleware de Autenticación
// ============================================

const { AuthService } = require('../services/authService');

const authService = new AuthService();

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticación requerido'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }

        const decoded = authService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { authenticate };