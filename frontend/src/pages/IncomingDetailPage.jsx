// ============================================
// src/pages/IncomingDetailPage.jsx - Detalle de Correspondencia
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incomingService } from '../api/incomingService';
import { DistributeModal } from '../components/DistributeModal';
import { Header } from '../components/Header';
import { motion } from 'framer-motion';

// Iconos
import {
    DocumentTextIcon,
    UserIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    PencilSquareIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline';

export const IncomingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [distributing, setDistributing] = useState(false);
    const [distributeError, setDistributeError] = useState('');
    const [distributeSuccess, setDistributeSuccess] = useState('');

    useEffect(() => {
        loadDocument();
    }, [id]);

    const loadDocument = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await incomingService.getById(id);
            setDocument(response.data.data);
        } catch (error) {
            setError('Error al cargar el documento');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleGoBack = () => {
        navigate('/incoming');
    };

    const handleEditClick = () => {
        navigate(`/incoming/${id}/edit`);
    };

    const handleDistributeClick = () => {
        setDistributeError('');
        setDistributeSuccess('');
        setShowDistributeModal(true);
    };

    const handleDistributeConfirm = async (docId, areaId) => {
        setDistributing(true);
        setDistributeError('');
        setDistributeSuccess('');

        try {
            await incomingService.distribute(docId, areaId);
            setDistributeSuccess('✅ Documento distribuido con éxito');
            await loadDocument();
            
            // Cerrar el modal después de 1.5 segundos
            setTimeout(() => {
                setShowDistributeModal(false);
                setDistributeSuccess('');
            }, 1500);
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al distribuir el documento';
            setDistributeError(msg);
        } finally {
            setDistributing(false);
        }
    };

    // Verificar si se puede editar (solo REGISTERED o DISTRIBUTED)
    const canEdit = document?.status === 'REGISTERED' || document?.status === 'DISTRIBUTED';

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
                        <p className="text-gray-500">Cargando documento...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 text-center">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Documento no encontrado</h2>
                        <p className="text-gray-500 mt-2">{error || 'El documento que buscas no existe'}</p>
                        <button
                            onClick={handleGoBack}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Volver a la lista
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const status = getStatusBadge(document.status);
    const StatusIcon = getStatusIcon(document.status);
    const isUrgent = document.urgencyLevel === 'URGENT';
    const isConfidential = document.isConfidential;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botón Volver */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Volver a la lista
                    </button>
                </motion.div>

                {/* Header del documento */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {document.folio}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap" data-cy="document-status-container">
                                <span data-cy="document-status" className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.className}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {status.label}
                                </span>
                                {isUrgent && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Urgente
                                    </span>
                                )}
                                {isConfidential && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                        <EyeSlashIcon className="w-4 h-4" />
                                        Confidencial
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {document.status === 'REGISTERED' && (
                                <button
                                    onClick={handleDistributeClick}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                    Distribuir
                                </button>
                            )}
                            {canEdit && (
                                <button
                                    onClick={handleEditClick}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02]"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    Editar
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Contenido del detalle */}
                <div className="space-y-6">
                    {/* Datos del Remitente */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                            Datos del Remitente
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
                                <p className="text-gray-800 mt-1">{document.senderName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Institución</label>
                                <p className="text-gray-800 mt-1">{document.senderInstitution || 'No especificada'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</label>
                                <p className="text-gray-800 mt-1">{document.senderPosition || 'No especificado'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Datos del Destinatario */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                            Datos del Destinatario
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Área Destino</label>
                                <p className="text-gray-800 mt-1">{document.recipientArea?.name || 'No especificada'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
                                <p className="text-gray-800 mt-1">{document.recipientName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</label>
                                <p className="text-gray-800 mt-1">{document.recipientPosition || 'No especificado'}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Datos del Documento */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                            Datos del Documento
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</label>
                                <p className="text-gray-800 mt-1">{document.subject}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Fojas</label>
                                    <p className="text-gray-800 mt-1">{document.pageCount}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Urgencia</label>
                                    <p className="text-gray-800 mt-1">{document.urgencyLevel === 'URGENT' ? 'Urgente' : 'Ordinario'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confidencial</label>
                                    <p className="text-gray-800 mt-1">{document.isConfidential ? 'Sí' : 'No'}</p>
                                </div>
                            </div>
                            {document.observations && (
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</label>
                                    <p className="text-gray-800 mt-1">{document.observations}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Fechas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
                    >
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                            Fechas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recepción</label>
                                <p className="text-gray-800 mt-1">{formatDate(document.receivedAt)}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distribución</label>
                                <p className="text-gray-800 mt-1">{formatDate(document.distributedAt) || 'Pendiente'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</label>
                                <p className="text-gray-800 mt-1">{formatDate(document.deliveredAt) || 'Pendiente'}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Modal de Distribución */}
                <DistributeModal
                    isOpen={showDistributeModal}
                    onClose={() => {
                        setShowDistributeModal(false);
                        setDistributeError('');
                        setDistributeSuccess('');
                    }}
                    onConfirm={handleDistributeConfirm}
                    documentId={id}
                    documentFolio={document?.folio}
                    documentSubject={document?.subject}
                    documentType={document?.urgencyLevel}
                    loading={distributing}
                />
            </main>
        </div>
    );
};