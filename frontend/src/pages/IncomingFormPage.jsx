// ============================================
// src/pages/IncomingFormPage.jsx - Formulario de Registro
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incomingService } from '../api/incomingService';
import { areaService } from '../api/areaService';

export const IncomingFormPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estado del formulario
    const [formData, setFormData] = useState({
        senderName: '',
        senderInstitution: '',
        senderPosition: '',
        recipientAreaId: '',
        recipientName: '',
        recipientPosition: '',
        subject: '',
        urgencyLevel: 'ORDINARY',
        isConfidential: false,
        pageCount: 1,
        observations: ''
    });

    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Cargar áreas al montar
    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            const response = await areaService.list();
            // Verificar si response.data es un array
            if (Array.isArray(response.data)) {
                setAreas(response.data);
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                setAreas(response.data.data);
            } else {
                setAreas([]);
            }
        } catch (error) {
            console.error('Error al cargar áreas:', error);
            setAreas([]);
        }
    };

    // Manejar cambios en los campos
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

    // ============================================
    // VALIDACIONES
    // ============================================

    const validate = () => {
        const errors = {};

        // 1. Validar campos requeridos
        const required = ['senderName', 'subject', 'recipientName', 'recipientAreaId'];
        required.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors[field] = 'Este campo es obligatorio';
            }
        });

        // 2. Validar longitud del asunto
        if (formData.subject && formData.subject.length < 10) {
            errors.subject = 'El asunto debe tener al menos 10 caracteres';
        }

        // 3. Validar número de fojas
        if (formData.pageCount && formData.pageCount < 1) {
            errors.pageCount = 'El número de fojas debe ser mayor a 0';
        }

        // 4. Validar nombre del remitente
        if (formData.senderName && formData.senderName.length < 3) {
            errors.senderName = 'El nombre debe tener al menos 3 caracteres';
        }

        // 5. Validar nombre del destinatario
        if (formData.recipientName && formData.recipientName.length < 3) {
            errors.recipientName = 'El nombre debe tener al menos 3 caracteres';
        }

        // 6. Validar área destino
        if (formData.recipientAreaId && formData.recipientAreaId === '') {
            errors.recipientAreaId = 'Debe seleccionar un área destino';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ============================================
    // ENVIAR FORMULARIO
    // ============================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            // Scroll al primer error
            const firstError = document.querySelector('.border-red-400');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await incomingService.create(formData);
            setSuccess(`Correspondencia registrada con éxito. Folio: ${response.data.data.folio}`);

            // Limpiar formulario después de 3 segundos
            setTimeout(() => {
                setFormData({
                    senderName: '',
                    senderInstitution: '',
                    senderPosition: '',
                    recipientAreaId: '',
                    recipientName: '',
                    recipientPosition: '',
                    subject: '',
                    urgencyLevel: 'ORDINARY',
                    isConfidential: false,
                    pageCount: 1,
                    observations: ''
                });
                setSuccess('');
                navigate('/incoming');
            }, 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error al registrar correspondencia';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Cancelar y volver
    const handleCancel = () => {
        navigate('/incoming');
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Registrar Correspondencia
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Completa los datos del documento
                            </p>
                        </div>
                        <button
                            onClick={handleCancel}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Mensajes */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* ============================================
                            SECCIÓN: REMITENTE
                            ============================================ */}
                        <div className="border-b border-gray-200 pb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Datos del Remitente
                            </h2>
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
                                        className={`w-full px-4 py-2 bg-white/50 border ${fieldErrors.senderName ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none`}
                                        placeholder="Nombre completo"
                                        autoFocus
                                    />
                                    {fieldErrors.senderName && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.senderName}
                                        </p>
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
                                        className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                                        placeholder="Institución"
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
                                        className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                                        placeholder="Cargo del remitente"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ============================================
                            SECCIÓN: DESTINATARIO
                            ============================================ */}
                        <div className="border-b border-gray-200 pb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Datos del Destinatario
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Área Destino <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="recipientAreaId"
                                        value={formData.recipientAreaId}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 bg-white/50 border ${fieldErrors.recipientAreaId ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none`}
                                    >
                                        <option value="">Seleccionar área</option>
                                        {Array.isArray(areas) && areas.map((area) => (
                                            <option key={area.id} value={area.id}>
                                                {area.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.recipientAreaId && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.recipientAreaId}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del Destinatario <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 bg-white/50 border ${fieldErrors.recipientName ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none`}
                                        placeholder="Nombre del destinatario"
                                    />
                                    {fieldErrors.recipientName && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.recipientName}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo del Destinatario
                                    </label>
                                    <input
                                        type="text"
                                        name="recipientPosition"
                                        value={formData.recipientPosition}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                                        placeholder="Cargo del destinatario"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ============================================
                            SECCIÓN: DOCUMENTO
                            ============================================ */}
                        <div className="border-b border-gray-200 pb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Datos del Documento
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Asunto <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        rows="3"
                                        className={`w-full px-4 py-2 bg-white/50 border ${fieldErrors.subject ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none resize-none`}
                                        placeholder="Describa el asunto del documento (mínimo 10 caracteres)"
                                    />
                                    {fieldErrors.subject && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {fieldErrors.subject}
                                        </p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nivel de Urgencia
                                        </label>
                                        <select
                                            name="urgencyLevel"
                                            value={formData.urgencyLevel}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                                        >
                                            <option value="ORDINARY">Ordinario</option>
                                            <option value="URGENT">Urgente</option>
                                        </select>
                                    </div>
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
                                            className={`w-full px-4 py-2 bg-white/50 border ${fieldErrors.pageCount ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'} rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none`}
                                        />
                                        {fieldErrors.pageCount && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                                {fieldErrors.pageCount}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isConfidential"
                                        checked={formData.isConfidential}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label className="text-sm text-gray-700">
                                        Documento Confidencial
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ============================================
                            SECCIÓN: OBSERVACIONES
                            ============================================ */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Observaciones
                            </h2>
                            <div>
                                <textarea
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none resize-none"
                                    placeholder="Observaciones adicionales"
                                />
                            </div>
                        </div>

                        {/* ============================================
                            BOTONES
                            ============================================ */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Registrar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};