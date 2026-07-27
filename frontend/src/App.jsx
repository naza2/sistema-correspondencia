// ============================================
// src/App.jsx - Componente Principal
// ============================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncomingListPage } from './pages/IncomingListPage';
import { IncomingFormPage } from './pages/IncomingFormPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { IncomingDetailPage } from './pages/IncomingDetailPage';
import { IncomingEditPage } from './pages/IncomingEditPage';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Ruta pública */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Rutas protegidas */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Ruta para listar entradas */}
                    <Route
                        path="/incoming"
                        element={
                            <ProtectedRoute>
                                <IncomingListPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Ruta para crear nueva entrada */}
                    <Route
                        path="/incoming/new"
                        element={
                            <ProtectedRoute>
                                <IncomingFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Ruta para ver detalles de una entrada */}
                    <Route
                        path="/incoming/:id"
                        element={
                            <ProtectedRoute>
                                <IncomingDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Ruta para editar una entrada */}
                    <Route
                        path="/incoming/:id/edit"
                        element={
                            <ProtectedRoute>
                                <IncomingEditPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirección por defecto */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    
                    {/* Redirección para rutas no encontradas */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;