// ============================================
// src/context/AuthContext.jsx - Contexto de Autenticación
// ============================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/authService';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar usuario al montar
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.verify(token);
                    setUser(response.data);
                } catch (error) {
                    console.error('Error al verificar token:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // Iniciar sesión
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(email, password);
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            setUser(userData);
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al iniciar sesión';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Cerrar sesión
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};