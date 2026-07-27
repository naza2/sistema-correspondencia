// ============================================
// cypress/support/index.js - Comandos personalizados
// ============================================

// Importar comandos
import './commands';

// Configuración global
Cypress.on('uncaught:exception', (err) => {
    // Prevenir que Cypress falle en errores no controlados
    return false;
});