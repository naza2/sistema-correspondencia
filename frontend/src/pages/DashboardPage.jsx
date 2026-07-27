// ============================================
// src/pages/DashboardPage.jsx - Dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/dashboardService';
import { Header } from '../components/Header';
import { motion } from 'framer-motion';

// Iconos
import {
    EnvelopeIcon,
    DocumentTextIcon,
    ClockIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        urgent: 0,
        confidential: 0,
        byStatus: {
            REGISTERED: 0,
            DISTRIBUTED: 0,
            DELIVERED: 0,
            ARCHIVED: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadStats();

        const handleFocus = () => {
            loadStats();
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await dashboardService.getStats();
            setStats(response.data.data);
            setLastUpdated(new Date());
        } catch (error) {
            setError('Error al cargar las estadísticas');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        REGISTERED: 'bg-blue-500',
        DISTRIBUTED: 'bg-yellow-500',
        DELIVERED: 'bg-green-500',
        ARCHIVED: 'bg-gray-500'
    };

    const statusLabels = {
        REGISTERED: 'Registrados',
        DISTRIBUTED: 'Distribuidos',
        DELIVERED: 'Entregados',
        ARCHIVED: 'Archivados'
    };

    const statusIcons = {
        REGISTERED: ClockIcon,
        DISTRIBUTED: PaperAirplaneIcon,
        DELIVERED: CheckCircleIcon,
        ARCHIVED: ArchiveBoxIcon
    };

    // Calcular porcentajes para el gráfico
    const total = stats.total || 1;
    const statusData = Object.entries(stats.byStatus).map(([key, value]) => ({
        status: key,
        label: statusLabels[key],
        count: value,
        percentage: Math.round((value / total) * 100),
        color: statusColors[key],
        Icon: statusIcons[key]
    }));

    const metrics = [
        {
            label: 'Total',
            value: stats.total,
            icon: EnvelopeIcon,
            color: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Hoy',
            value: stats.today,
            icon: DocumentTextIcon,
            color: 'from-green-500 to-green-600'
        },
        {
            label: 'Urgentes',
            value: stats.urgent,
            icon: ExclamationTriangleIcon,
            color: 'from-red-500 to-red-600'
        },
        {
            label: 'Confidenciales',
            value: stats.confidential,
            icon: UserCircleIcon,
            color: 'from-purple-500 to-purple-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Cargando estadísticas...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Bienvenida */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <UserCircleIcon className="w-10 h-10 text-blue-600" />
                                <span>
                                    ¡Bienvenido,{' '}
                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        {user?.firstName}
                                    </span>
                                    !
                                </span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 ml-14 mt-1 text-gray-500 text-sm">
                                <p>{stats.total} documentos en total · {stats.today} nuevos hoy</p>
                                {lastUpdated && (
                                    <p>Última actualización: {new Date(lastUpdated).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/incoming')}
                                className="px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/20 text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                Ver Entradas
                            </button>
                            <button
                                onClick={loadStats}
                                className="px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/20 text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a1 1 0 011 1v2a1 1 0 11-2 0V5a1 1 0 011-1zm10 0a1 1 0 011 1v2a1 1 0 11-2 0V5a1 1 0 011-1zM4 13a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm10 0a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM6 6h8a1 1 0 010 2H6a1 1 0 010-2zm0 6h8a1 1 0 010 2H6a1 1 0 010-2z" clipRule="evenodd" />
                                </svg>
                                Actualizar
                            </button>
                            <button
                                onClick={() => navigate('/incoming/new')}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva Entrada
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Cards de métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">{metric.label}</p>
                                        <p className="text-3xl font-bold text-gray-800 mt-1" data-cy={metric.label === 'Distribuidos' ? 'dashboard-distributed-count' : undefined}>{metric.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Gráfico de distribución */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                        Distribución por Estado
                    </h3>
                    <div className="space-y-4">
                        {statusData.map((item) => (
                            <div key={item.status} className="flex items-center gap-4" data-cy={item.status === 'DISTRIBUTED' ? 'dashboard-distributed-count' : undefined}>
                                <div className="flex items-center gap-2 w-32">
                                    <item.Icon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{item.label}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full ${item.color} transition-all duration-1000`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-20">
                                    <span className="text-sm font-medium text-gray-700" data-cy={item.status === 'DISTRIBUTED' ? 'dashboard-distributed-count' : undefined}>{item.count}</span>
                                    <span className="text-xs text-gray-500">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {stats.total === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No hay documentos registrados</p>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
};