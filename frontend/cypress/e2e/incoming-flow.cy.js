// ============================================
// cypress/e2e/incoming-flow.cy.js - Flujo de Correspondencia
// ============================================

describe('Flujo de Correspondencia de Entrada', () => {
    beforeEach(() => {
        // Hacer login antes de cada prueba
        cy.login('admin@infodf.gob.mx', 'admin123');
        cy.visit('/dashboard');
    });

    // ============================================
    // 1. PRUEBA: Registro de Correspondencia
    // ============================================

    describe('Registro de Correspondencia', () => {
        it('debe registrar una nueva correspondencia', () => {
            // 1. Ir al formulario
            cy.get('button').contains('Nueva Entrada').click();
            cy.url().should('include', '/incoming/new');

            // 2. Llenar el formulario
            cy.get('input[name="senderName"]').type('Test Sender');
            cy.get('input[name="senderInstitution"]').type('Test Institution');
            cy.get('input[name="senderPosition"]').type('Test Position');
            cy.get('select[name="recipientAreaId"]').select('Dirección General');
            cy.get('input[name="recipientName"]').type('Test Recipient');
            cy.get('textarea[name="subject"]').type('Test Subject for E2E - Debe tener más de 10 caracteres');
            cy.get('select[name="urgencyLevel"]').select('URGENT');
            cy.get('input[name="pageCount"]').clear().type('5');
            cy.get('textarea[name="observations"]').type('Test observations');

            // 3. Enviar formulario
            cy.get('button[type="submit"]').click();

            // 4. Verificar éxito
            cy.contains('Correspondencia registrada con éxito').should('be.visible');
            cy.url().should('include', '/incoming');
        });

        it('debe mostrar errores de validación', () => {
            // 1. Ir al formulario
            cy.visit('/incoming/new');

            // 2. Ingresar un asunto corto para validar longitud
            cy.get('textarea[name="subject"]').type('Prueba');

            // 3. Intentar enviar
            cy.get('button[type="submit"]').click();

            // 4. Verificar mensajes de error
            cy.contains('Este campo es obligatorio').should('be.visible');
            cy.contains('El asunto debe tener al menos 10 caracteres').should('be.visible');
        });
    });

    // ============================================
    // 2. PRUEBA: Listado de Correspondencia
    // ============================================

    describe('Listado de Correspondencia', () => {
        it('debe mostrar la lista de correspondencia', () => {
            // 1. Ir al listado
            cy.visit('/incoming');

            // 2. Verificar que la tabla existe
            cy.get('table').should('exist');
            cy.get('table tbody tr').should('have.length.at.least', 1);
        });

        it('debe filtrar por búsqueda', () => {
            // 1. Ir al listado
            cy.visit('/incoming');

            // 2. Buscar por folio
            cy.get('input[type="text"]').first().type('INF-2026-0001');
            cy.get('input[type="text"]').first().should('have.value', 'INF-2026-0001');

            // 3. Verificar resultados
            cy.get('table tbody tr').should('have.length.at.least', 1);
            cy.get('table').should('contain', 'INF-2026-0001');
        });
    });

    // ============================================
    // 3. PRUEBA: Detalle de Correspondencia
    // ============================================

    describe('Detalle de Correspondencia', () => {
        it('debe mostrar el detalle de un documento', () => {
            // 1. Ir al listado
            cy.visit('/incoming');

            // 2. Hacer clic en el botón de detalle del primer documento
            cy.get('table tbody tr').first().find('button').first().click();

            // 3. Verificar que se muestra el detalle
            cy.url().should('match', /\/incoming\/[a-f0-9-]+/);
            cy.get('h1').should('exist');
            cy.get('h1').should('contain', 'INF-');
        });
    });

    // ============================================
    // 4. PRUEBA: Edición de Correspondencia
    // ============================================

    describe('Edición de Correspondencia', () => {
        it('debe editar un documento existente', () => {
            // 1. Crear un documento de prueba vía API
            cy.createTestDocument({
                subject: 'E2E Edit Subject',
                recipientName: 'Edit Recipient'
            }).then((document) => {
                // 2. Ir al listado y abrir el detalle del documento creado
                cy.visit('/incoming');
                cy.contains('tr', document.folio).within(() => {
                    cy.get('button[title="Ver detalle"]').click();
                });

                // 3. Navegar a la página de edición
                cy.contains('Editar').click();
                cy.url().should('include', '/edit');

                // 4. Editar el asunto y el nombre del destinatario
                cy.get('input[name="subject"]').clear().type('E2E Edit Subject Updated');
                cy.get('input[name="recipientName"]').clear().type('Edit Recipient Updated');
                cy.get('button[type="submit"]').contains('Guardar Cambios').click();

                // 5. Verificar que se guardaron los cambios
                cy.contains('✅').should('be.visible');
                cy.url().should('match', /\/incoming\/[a-f0-9-]+$/);
            });
        });

        it('debe editar un documento ya distribuido desde el detalle', () => {
            // 1. Crear un documento de prueba y distribuirlo
            cy.createTestDocument({
                subject: 'E2E Distributed Document',
                recipientName: 'Distributed Recipient'
            }).then((document) => {
                cy.distributeTestDocument(document.id).then(() => {
                    // 2. Ir al detalle del documento distribuido
                    cy.visit(`/incoming/${document.id}`);

                    // 3. Verificar que el documento está distribuido
                    cy.get('[data-cy="document-status-container"]', { timeout: 20000 }).should('exist');
                    cy.get('[data-cy="document-status"]', { timeout: 20000 }).should('contain', 'Distribuido');

                    // 4. Desde el detalle, ir a editar
                    cy.contains('Editar').click();
                    cy.url().should('include', `/incoming/${document.id}/edit`);
                    cy.get('[data-cy="current-status"]', { timeout: 20000 }).should('contain', 'Distribuido');

                    // 5. Cambiar asunto y enviar
                    cy.get('input[name="subject"]').clear().type('E2E Distributed Edited Subject');
                    cy.get('button[type="submit"]').contains('Guardar Cambios').click();

                    // 6. Verificar mensajes de validación y la redirección
                    cy.contains('✅').should('be.visible');
                    cy.url().should('include', `/incoming/${document.id}`);
                    cy.get('[data-cy="document-status"]').should('contain', 'Distribuido');
                });
            });
        });
    });

    // ============================================
    // 5. PRUEBA: Distribución de Correspondencia
    // ============================================

    describe('Distribución de Correspondencia', () => {
        it('debe mostrar el modal de distribución', () => {
            // 1. Crear un documento registrado para distribuir
            cy.createTestDocument({
                subject: 'E2E Modal Distribución',
                recipientName: 'Distribution Recipient'
            }).then((document) => {
                // 2. Ir al listado y abrir el modal de distribución desde el documento creado
                cy.visit('/incoming');
                cy.contains('tr', document.folio).within(() => {
                    cy.get('button[title="Distribuir"]').click();
                });

                // 3. Verificar que el modal aparece
                cy.contains('h3', 'Distribuir Documento').should('be.visible');
                cy.get('select').should('exist');
            });
        });

        it('debe distribuir un documento correctamente y actualizar el contador de distribuidos', () => {
            // 1. Tomar el valor actual del contador de distribuidos
            cy.visit('/dashboard');
            cy.get('[data-cy="dashboard-distributed-count"]', { timeout: 20000 }).invoke('text').then((text) => {
                const initialCount = Number(text.trim()) || 0;

                // 2. Crear un documento registrado para distribuir
                cy.createTestDocument({
                    subject: 'E2E Distribuir Documento',
                    recipientName: 'Distribution Recipient'
                }).then((document) => {
                    // 3. Ir al listado y abrir el modal de distribución desde el documento creado
                    cy.visit('/incoming');
                    cy.contains('tr', document.folio).within(() => {
                        cy.get('button[title="Distribuir"]').click();
                    });

                    // 4. Configurar la alerta antes de confirmar
                    cy.on('window:alert', (text) => {
                        expect(text).to.contains('Documento distribuido con éxito');
                    });

                    // 5. Seleccionar un área y confirmar distribución
                    cy.get('select').select('Dirección General');
                    cy.get('button').contains('Distribuir').click();

                    // 6. Verificar el contador en el dashboard se incrementó en 1
                    cy.visit('/dashboard');
                    cy.get('[data-cy="dashboard-distributed-count"]', { timeout: 20000 }).invoke('text').then((textAfter) => {
                        const afterCount = Number(textAfter.trim()) || 0;
                        expect(afterCount).to.equal(initialCount + 1);
                    });
                });
            });
        });
    });

    // ============================================
    // 5. PRUEBA: Dashboard
    // ============================================

    describe('Dashboard', () => {
        it('debe mostrar las métricas del dashboard', () => {
            // 1. Ir al dashboard
            cy.visit('/dashboard');

            // 2. Verificar que las métricas existen
            cy.get('.bg-white\\/70').should('exist');
            cy.get('.text-3xl.font-bold').should('exist');
            cy.contains('Total').should('exist');
            cy.contains('Hoy').should('exist');
            cy.contains('Urgentes').should('exist');
            cy.contains('Confidenciales').should('exist');
        });

        it('debe mostrar el gráfico de distribución', () => {
            // 1. Ir al dashboard
            cy.visit('/dashboard');

            // 2. Verificar que el gráfico existe
            cy.contains('Distribución por Estado').should('exist');
            cy.contains('Registrados').should('exist');
            cy.contains('Distribuidos').should('exist');
            cy.contains('Entregados').should('exist');
        });

        it('debe navegar al listado desde el dashboard', () => {
            // 1. Ir al dashboard
            cy.visit('/dashboard');

            // 2. Hacer clic en "Ver Entradas"
            cy.contains('Ver Entradas').click();

            // 3. Verificar redirección
            cy.url().should('include', '/incoming');
        });
    });

    // ============================================
    // 6. PRUEBA: Logout
    // ============================================

    describe('Logout', () => {
        it('debe cerrar sesión correctamente', () => {
            // 1. Ir al dashboard
            cy.visit('/dashboard');

            // 2. Hacer clic en "Cerrar Sesión"
            cy.contains('Cerrar Sesión').click();

            // 3. Verificar redirección al login
            cy.url().should('include', '/login');

            // 4. Verificar que el token fue eliminado
            cy.window().then((win) => {
                expect(win.localStorage.getItem('token')).to.be.null;
            });
        });
    });
});