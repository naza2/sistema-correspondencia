// ============================================
// src/api/incomingService.js - Servicio de Correspondencia
// ============================================

import { api } from './client';

export const incomingService = {
    /**
     * Registrar una nueva correspondencia
     * @param {Object} data - Datos de la correspondencia
     * @returns {Promise} - Respuesta del servidor
     */
    create: (data) => {
        return api.post('/incoming', data);
    },

    /**
     * Listar todas las correspondencias
     * @returns {Promise} - Lista de correspondencias
     */
    list: () => {
        return api.get('/incoming');
    },

    /**
     * Obtener una correspondencia por ID
     * @param {string} id - ID de la correspondencia
     * @returns {Promise} - Datos de la correspondencia
     */
    getById: (id) => {
        return api.get(`/incoming/${id}`);
    },

    /**
     * Actualizar una correspondencia
     * @param {string} id - ID de la correspondencia
     * @param {Object} data - Datos a actualizar
     * @returns {Promise} - Respuesta del servidor
     */
    update: (id, data) => {
        return api.put(`/incoming/${id}`, data);
    },

    /**
     * Distribuir una correspondencia
     * @param {string} id - ID de la correspondencia
     * @param {string} areaId - ID del área destino
     * @returns {Promise} - Respuesta del servidor
     */
    distribute: (id, areaId) => {
        return api.put(`/incoming/${id}/distribute`, { areaId });
    }
};