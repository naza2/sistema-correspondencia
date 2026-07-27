// ============================================
// src/components/DistributeModal.jsx - Modal de Distribución
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    PaperAirplaneIcon,
    UserGroupIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { areaService } from '../api/areaService';

export const DistributeModal = ({
    isOpen,
    onClose,
    onConfirm,
    documentId,
    documentFolio,
    documentSubject,
    documentType,
    loading: externalLoading
}) => {
    const [areas, setAreas] = useState([]);
    const [selectedArea, setSelectedArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Usar loading externo o interno
    const isSubmitting = externalLoading || loading;

    useEffect(() => {
        if (isOpen) {
            setSelectedArea('');
            setError('');
            setSuccess('');
            loadAreas();
        }
    }, [isOpen]);

    const loadAreas = async () => {
        try {
            const response = await areaService.list();
            if (Array.isArray(response.data)) {
                setAreas(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setAreas(response.data.data);
            } else {
                // Fallback: áreas predefinidas si no hay endpoint
                setAreas([
                    { id: '11111111-1111-1111-1111-111111111111', name: 'Dirección General' },
                    { id: '22222222-2222-2222-2222-222222222222', name: 'Dirección de Asuntos Jurídicos' },
                    { id: '33333333-3333-3333-3333-333333333333', name: 'Dirección de Archivos' },
                    { id: '44444444-4444-4444-4444-444444444444', name: 'Dirección de Transparencia' },
                    { id: '55555555-5555-5555-5555-555555555555', name: 'Atención Ciudadana' },
                    { id: '66666666-6666-6666-6666-666666666666', name: 'Dirección de Finanzas' },
                    { id: '77777777-7777-7777-7777-777777777777', name: 'Dirección de Recursos Humanos' },
                    { id: '88888888-8888-8888-8888-888888888888', name: 'Dirección de Tecnologías' },
                    { id: '99999999-9999-9999-9999-999999999999', name: 'Dirección de Comunicación' },
                    { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Dirección de Planeación' }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar áreas:', error);
            setError('Error al cargar las áreas');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedArea) {
            setError('Debes seleccionar un área destino');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await onConfirm(documentId, selectedArea);
            setSuccess('✅ Documento distribuido con éxito');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.error || 'Error al distribuir el documento');
        } finally {
            setLoading(false);
        }
    };

    // Si no está abierto, no renderizar
    if (!isOpen) return null;

    const isUrgent = documentType === 'URGENT' || documentType === 'URGENTE';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Distribuir Documento
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {documentFolio || 'Sin folio'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                disabled={isSubmitting}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Información del documento */}
                            <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
                                <div className="flex items-start gap-3">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                                            Documento
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 truncate">
                                            {documentSubject || 'Sin asunto'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Área Destino */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Área Destino <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={selectedArea}
                                        onChange={(e) => setSelectedArea(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none ${
                                            error && !success ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Selecciona un área</option>
                                        {areas.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mensaje de Error */}
                                {error && !success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg"
                                    >
                                        <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Mensaje de Éxito */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg"
                                    >
                                        <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                                        <span>{success}</span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Alerta si es urgente */}
                            {isUrgent && (
                                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-red-700">Documento Urgente</p>
                                        <p className="text-xs text-red-600">
                                            Se recomienda notificar al área destino de inmediato.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium"
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !selectedArea}
                                className={`px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-200 flex items-center gap-2 text-sm ${
                                    isSubmitting || !selectedArea ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                                }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                        Distribuir
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};