// ============================================
// src/api/authService.js - Servicio de Autenticación
// ============================================

import { api } from './client';

export const authService = {
    /**
     * Iniciar sesión
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise} - Respuesta del servidor
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    /**
     * Verificar token
     * @param {string} token - Token JWT
     * @returns {Promise} - Respuesta del servidor
     */
    verify: async (token) => {
        const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};