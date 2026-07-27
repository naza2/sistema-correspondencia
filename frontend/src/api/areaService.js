// src/api/areaService.js
import { api } from './client';

export const areaService = {
    list: () => {
        return api.get('/areas');
    },
    getById: (id) => {
        return api.get(`/areas/${id}`);
    }
};