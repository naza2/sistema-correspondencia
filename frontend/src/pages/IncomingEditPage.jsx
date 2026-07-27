// ============================================
// src/pages/IncomingEditPage.jsx - Editar Correspondencia
// ============================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incomingService } from '../api/incomingService';
import { Header } from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

// Iconos
import {
    ArrowLeftIcon,
    DocumentTextIcon,
    PencilSquareIcon,
    UserIcon,
    BuildingOfficeIcon,
    EyeSlashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export const IncomingEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        senderName: '',
        senderInstitution: '',
        senderPosition: '',
        recipientAreaId: '',
        recipientName: '',
        recipientPosition: '',
        subject: '',
        pageCount: 1,
        urgencyLevel: 'ORDINARY',
        isConfidential: false,
        observations: ''
    });
    const [areas, setAreas] = useState([]);
    const [originalStatus, setOriginalStatus] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Áreas con UUIDs válidos
    const AREAS_DATA = [
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
    ];

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const docResponse = await incomingService.getById(id);
            const doc = docResponse.data.data;

            if (doc.status === 'DELIVERED' || doc.status === 'ARCHIVED') {
                setError('No se puede editar un documento entregado o archivado');
                setLoading(false);
                return;
            }

            setOriginalStatus(doc.status);
            setAreas(AREAS_DATA);

            // Buscar el área correcta del documento
            const currentArea = AREAS_DATA.find(a => a.id === doc.recipientAreaId);
            
            setFormData({
                senderName: doc.senderName || '',
                senderInstitution: doc.senderInstitution || '',
                senderPosition: doc.senderPosition || '',
                recipientAreaId: currentArea?.id || doc.recipientAreaId || '',
                recipientName: doc.recipientName || '',
                recipientPosition: doc.recipientPosition || '',
                subject: doc.subject || '',
                pageCount: doc.pageCount || 1,
                urgencyLevel: doc.urgencyLevel || 'ORDINARY',
                isConfidential: doc.isConfidential || false,
                observations: doc.observations || ''
            });

        } catch (error) {
            setError('Error al cargar los datos');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.senderName.trim()) errors.senderName = 'El nombre del remitente es obligatorio';
        if (!formData.recipientAreaId) errors.recipientAreaId = 'El área destino es obligatoria';
        if (!formData.recipientName.trim()) errors.recipientName = 'El nombre del destinatario es obligatorio';
        if (!formData.subject.trim()) {
            errors.subject = 'El asunto es obligatorio';
        } else if (formData.subject.trim().length < 10) {
            errors.subject = 'El asunto debe tener al menos 10 caracteres';
        }
        if (!formData.pageCount || Number(formData.pageCount) < 1) {
            errors.pageCount = 'El número de fojas debe ser al menos 1';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await incomingService.update(id, formData);
            setSuccessMessage(`✅ ${response.data.message || 'Correspondencia actualizada con éxito'}`);
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                navigate(`/incoming/${id}`);
            }, 2000);
            
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al actualizar';
            setError(msg);
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate(`/incoming/${id}`);
    };

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
                        <p className="text-gray-500">Cargando datos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !formData.senderName) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-8 text-center">
                        <DocumentTextIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">No se puede editar</h2>
                        <p className="text-gray-500 mt-2">{error}</p>
                        <button
                            onClick={handleGoBack}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Volver al detalle
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Header />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        Volver al detalle
                    </button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <PencilSquareIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">
                            Editar Correspondencia
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1">
                        Modifica los datos del documento. Los cambios quedarán registrados en la auditoría.
                    </p>
                </motion.div>

                {/* Formulario */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8"
                >
                    {/* Mensaje de Éxito */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                            >
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-green-700">{successMessage}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mensaje de Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                            >
                                <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span className="text-red-700">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Datos del Remitente */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-blue-600" />
                                Datos del Remitente
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="senderName"
                                        value={formData.senderName}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            fieldErrors.senderName ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                        }`}
                                    />
                                    {fieldErrors.senderName && (
                                        <p className="text-sm text-red-500 mt-1">{fieldErrors.senderName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Institución
                                    </label>
                                    <input
                                        type="text"
                                        name="senderInstitution"
                                        value={formData.senderInstitution}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo
                                    </label>
                                    <input
                                        type="text"
                                        name="senderPosition"
                                        value={formData.senderPosition}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Datos del Destinatario */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                Datos del Destinatario
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Área Destino <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="recipientAreaId"
                                        value={formData.recipientAreaId}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none ${
                                            fieldErrors.recipientAreaId ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                        }`}
                                    >
                                        <option value="">Seleccionar área</option>
                                        {areas.map(area => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.recipientAreaId && (
                                        <p className="text-sm text-red-500 mt-1">{fieldErrors.recipientAreaId}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            fieldErrors.recipientName ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                        }`}
                                    />
                                    {fieldErrors.recipientName && (
                                        <p className="text-sm text-red-500 mt-1">{fieldErrors.recipientName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo
                                    </label>
                                    <input
                                        type="text"
                                        name="recipientPosition"
                                        value={formData.recipientPosition}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Datos del Documento */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                                Datos del Documento
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asunto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                            fieldErrors.subject ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                        }`}
                                    />
                                    {fieldErrors.subject && (
                                        <p className="text-sm text-red-500 mt-1">{fieldErrors.subject}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Fojas
                                        </label>
                                        <input
                                            type="number"
                                            name="pageCount"
                                            value={formData.pageCount}
                                            onChange={handleChange}
                                            min="1"
                                            className={`w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                                                fieldErrors.pageCount ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-200'
                                            }`}
                                        />
                                        {fieldErrors.pageCount && (
                                            <p className="text-sm text-red-500 mt-1">{fieldErrors.pageCount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Urgencia
                                        </label>
                                        <select
                                            name="urgencyLevel"
                                            value={formData.urgencyLevel}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                                        >
                                            <option value="ORDINARY">Ordinario</option>
                                            <option value="URGENT">Urgente</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isConfidential"
                                                checked={formData.isConfidential}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                                            Confidencial
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Observaciones
                                    </label>
                                    <textarea
                                        name="observations"
                                        value={formData.observations}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estado actual */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 flex items-center gap-2" data-cy="current-status">
                                <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                                <span>
                                    <span className="font-medium">Estado actual:</span>{' '}
                                    {originalStatus === 'REGISTERED' && 'Registrado'}
                                    {originalStatus === 'DISTRIBUTED' && 'Distribuido'}
                                    {originalStatus === 'DELIVERED' && 'Entregado'}
                                    {originalStatus === 'ARCHIVED' && 'Archivado'}
                                </span>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 flex items-center gap-2 ${
                                    submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
                                }`}
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </main>
        </div>
    );
};