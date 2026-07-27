// ============================================
// src/controllers/authController.js - Controlador de Autenticación
// ============================================

const { AuthService } = require('../services/authService');

const authService = new AuthService();

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar que se proporcionen email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        const result = await authService.login(email, password);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || 'Error al iniciar sesión'
        });
    }
};

/**
 * GET /api/auth/verify
 * Verificar token JWT
 */
const verify = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const decoded = authService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        res.json({
            success: true,
            data: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { login, verify };