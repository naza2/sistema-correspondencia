// ============================================
// cypress/support/commands.js - Comandos personalizados
// ============================================

// ============================================
// Comando de Login
// ============================================

Cypress.Commands.add('login', (email, password) => {
    cy.session([email, password], () => {
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/auth/login',
            body: {
                email,
                password
            }
        }).then((response) => {
            expect(response.status).to.equal(200);
            const token = response.body.data.token;
            window.localStorage.setItem('token', token);
            cy.visit('/dashboard');
            cy.contains('¡Bienvenido,').should('be.visible');
        });
    });
});

// ============================================
// Comando para crear un documento de prueba
// ============================================

Cypress.Commands.add('createTestDocument', (data = {}) => {
    const defaultData = {
        senderName: 'Test Sender',
        senderInstitution: 'Test Institution',
        senderPosition: 'Test Position',
        recipientName: 'Test Recipient',
        recipientAreaId: '11111111-1111-1111-1111-111111111111',
        subject: 'Test Subject for E2E - Debe tener más de 10 caracteres',
        urgencyLevel: 'ORDINARY',
        isConfidential: false,
        pageCount: 1,
        observations: 'Test observations'
    };

    const payload = { ...defaultData, ...data };

    // Obtener token
    return cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
            email: 'admin@infodf.gob.mx',
            password: 'admin123'
        }
    }).then((response) => {
        const token = response.body.data.token;

        // Crear documento
        return cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/incoming',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: payload
        }).then((createResponse) => createResponse.body.data);
    });
});

// ============================================
// Comando para distribuir un documento de prueba
// ============================================
Cypress.Commands.add('distributeTestDocument', (documentId, areaId = '22222222-2222-2222-2222-222222222222') => {
    return cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
            email: 'admin@infodf.gob.mx',
            password: 'admin123'
        }
    }).then((response) => {
        const token = response.body.data.token;
        return cy.request({
            method: 'PUT',
            url: `http://localhost:3000/api/incoming/${documentId}/distribute`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: { areaId }
        });
    });
});

// ============================================
// Comando para verificar toast
// ============================================

Cypress.Commands.add('verifyToast', (message) => {
    cy.contains(message).should('be.visible');
});

// ============================================
// Comando para limpiar datos de prueba
// ============================================

Cypress.Commands.add('clearTestData', () => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/test/clear',
        failOnStatusCode: false
    });
});