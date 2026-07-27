// ============================================
// src/pages/IncomingListPage.jsx - Listado de Correspondencia
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incomingService } from '../api/incomingService';
import { DistributeModal } from '../components/DistributeModal';
import { Header } from '../components/Header';
import { motion } from 'framer-motion';

// Iconos
import {
    MagnifyingGlassIcon,
    EyeIcon,
    PaperAirplaneIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    ArchiveBoxIcon,
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

export const IncomingListPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [incoming, setIncoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [distributing, setDistributing] = useState(false);

    // Cargar datos al montar
    useEffect(() => {
        loadIncoming();
    }, []);

    // Filtrar cuando cambia el término de búsqueda
    useEffect(() => {
        filterData();
    }, [searchTerm, incoming]);

    const loadIncoming = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await incomingService.list();
            setIncoming(response.data.data);
            setFilteredData(response.data.data);
        } catch (error) {
            setError('Error al cargar la lista de correspondencia');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        if (!searchTerm.trim()) {
            setFilteredData(incoming);
            return;
        }

        const term = searchTerm.toLowerCase().trim();
        const filtered = incoming.filter(item =>
            item.folio?.toLowerCase().includes(term) ||
            item.senderName?.toLowerCase().includes(term) ||
            item.subject?.toLowerCase().includes(term) ||
            item.recipientName?.toLowerCase().includes(term)
        );
        setFilteredData(filtered);
    };

    // ============================================
    // PAGINACIÓN
    // ============================================

    // Obtener elementos de la página actual
    const getCurrentItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredData.slice(startIndex, endIndex);
    };

    // Total de páginas
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Cambiar de página
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            // Scroll al inicio de la tabla
            document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Generar números de página para mostrar
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            range.push(i);
        }

        for (let i of range) {
            if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= delta) {
                rangeWithDots.push(i);
            } else if (rangeWithDots[rangeWithDots.length - 1] !== '...') {
                rangeWithDots.push('...');
            }
        }

        return rangeWithDots;
    };

    // ============================================
    // DISTRIBUIR
    // ============================================

    const handleViewDetail = (id) => {
        navigate(`/incoming/${id}`);
    };

    const handleDistributeClick = (id) => {
        setSelectedDocumentId(id);
        setShowDistributeModal(true);
    };

    const handleDistributeConfirm = async (id, areaId) => {
        setDistributing(true);
        try {
            await incomingService.distribute(id, areaId);
            await loadIncoming();
            alert('✅ Documento distribuido con éxito');
        } catch (error) {
            alert('❌ Error al distribuir: ' + (error.response?.data?.error || error.message));
        } finally {
            setDistributing(false);
        }
    };

    // ============================================
    // RENDER
    // ============================================

    const getStatusBadge = (status) => {
        const styles = {
            'REGISTERED': 'bg-blue-100 text-blue-700',
            'DISTRIBUTED': 'bg-yellow-100 text-yellow-700',
            'DELIVERED': 'bg-green-100 text-green-700',
            'ARCHIVED': 'bg-gray-100 text-gray-700'
        };
        const labels = {
            'REGISTERED': 'Registrado',
            'DISTRIBUTED': 'Distribuido',
            'DELIVERED': 'Entregado',
            'ARCHIVED': 'Archivado'
        };
        return {
            className: styles[status] || 'bg-gray-100 text-gray-700',
            label: labels[status] || status
        };
    };

    const getStatusIcon = (status) => {
        const icons = {
            'REGISTERED': ClockIcon,
            'DISTRIBUTED': PaperAirplaneIcon,
            'DELIVERED': CheckCircleIcon,
            'ARCHIVED': ArchiveBoxIcon
        };
        return icons[status] || DocumentTextIcon;
    };

    const currentItems = getCurrentItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Botón Volver al Dashboard */}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                                title="Volver al Dashboard"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Correspondencia de Entrada
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    {filteredData.length} documentos encontrados
                                </p>
                            </div>
                        </div>
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
                </motion.div>

                {/* Buscador */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                >
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por folio, remitente o asunto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                        />
                    </div>
                </motion.div>

                {/* Tabla */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl overflow-hidden"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500">Cargando...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500">{error}</p>
                            <button
                                onClick={loadIncoming}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No hay correspondencia registrada</p>
                            {searchTerm && (
                                <p className="text-gray-400 text-sm mt-1">
                                    No se encontraron resultados para "{searchTerm}"
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto table-container">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Folio
                                            </th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Fecha
                                            </th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Remitente
                                            </th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Asunto
                                            </th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Estado
                                            </th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Prioridad
                                            </th>
                                            <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentItems.map((item) => {
                                            const status = getStatusBadge(item.status);
                                            const StatusIcon = getStatusIcon(item.status);
                                            const isUrgent = item.urgencyLevel === 'URGENT';

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-white/50 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-medium text-gray-900">
                                                            {item.folio}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-600">
                                                            {new Date(item.receivedAt).toLocaleDateString('es-MX')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {item.senderName}
                                                            </p>
                                                            {item.senderInstitution && (
                                                                <p className="text-xs text-gray-500">
                                                                    {item.senderInstitution}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-700 max-w-xs truncate">
                                                            {item.subject}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {isUrgent ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                Urgente
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                                Normal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => handleViewDetail(item.id)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                                title="Ver detalle"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                            {item.status === 'REGISTERED' && (
                                                                <button
                                                                    onClick={() => handleDistributeClick(item.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                                                    title="Distribuir"
                                                                >
                                                                    <PaperAirplaneIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        Mostrando {(currentPage - 1) * itemsPerPage + 1} -{' '}
                                        {Math.min(currentPage * itemsPerPage, filteredData.length)} de{' '}
                                        {filteredData.length} registros
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        {getPageNumbers().map((page, index) => (
                                            <button
                                                key={index}
                                                onClick={() => typeof page === 'number' && goToPage(page)}
                                                disabled={page === '...'}
                                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                    page === currentPage
                                                        ? 'bg-blue-600 text-white'
                                                        : page === '...'
                                                        ? 'text-gray-400 cursor-default'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Modal de Distribución */}
                <DistributeModal
                    isOpen={showDistributeModal}
                    onClose={() => setShowDistributeModal(false)}
                    onConfirm={handleDistributeConfirm}
                    documentId={selectedDocumentId}
                />
            </main>
        </div>
    );
};