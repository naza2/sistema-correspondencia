// ============================================
// src/api/dashboardService.js - Servicio de Dashboard
// ============================================

import { api } from './client';

export const dashboardService = {
    /**
     * Obtener estadísticas del dashboard
     * @returns {Promise} - Estadísticas del dashboard
     */
    getStats: () => {
        return api.get('/dashboard/stats');
    }
};