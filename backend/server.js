// ============================================
// backend/server.js - Servidor Principal
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');
const { User, Area } = require('./src/models');
const routes = require('./src/routes');

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

/**
 * Crear áreas por defecto
 */
async function createDefaultAreas() {
    const areas = [
        { code: 'DG', name: 'Dirección General' },
        { code: 'DAJ', name: 'Dirección de Asuntos Jurídicos' },
        { code: 'DA', name: 'Dirección de Archivos' },
        { code: 'DT', name: 'Dirección de Transparencia' },
        { code: 'AC', name: 'Atención Ciudadana' },
        { code: 'DF', name: 'Dirección de Finanzas' },
        { code: 'DRH', name: 'Dirección de Recursos Humanos' },
        { code: 'DTI', name: 'Dirección de Tecnologías' },
        { code: 'DCO', name: 'Dirección de Comunicación' },
        { code: 'DP', name: 'Dirección de Planeación' }
    ];

    try {
        let createdCount = 0;
        for (const areaData of areas) {
            const [area, created] = await Area.findOrCreate({
                where: { code: areaData.code },
                defaults: {
                    name: areaData.name,
                    description: `${areaData.name} - Área del Sistema de Control de Correspondencia`
                }
            });
            if (created) {
                createdCount++;
                console.log(`✅ Área creada: ${area.code} - ${area.name}`);
            }
        }
        console.log(`✅ ${createdCount} áreas cargadas correctamente`);
        if (createdCount === 0) {
            console.log('ℹ️ Todas las áreas ya existen');
        }
    } catch (error) {
        console.error('❌ Error al crear áreas:', error.message);
        if (error.errors) {
            error.errors.forEach(e => {
                console.error(`  - ${e.path}: ${e.message}`);
            });
        }
    }
}

/**
 * Crear usuario admin
 */
async function createAdminUser() {
    try {
        const existingUser = await User.findOne({
            where: { email: 'admin@infodf.gob.mx' }
        });

        if (!existingUser) {
            const adminUser = await User.create({
                username: 'admin',
                email: 'admin@infodf.gob.mx',
                passwordHash: 'admin123',
                firstName: 'Admin',
                lastName: 'Sistema',
                role: 'admin',
                isActive: true
            });
            console.log('✅ Usuario admin creado:');
            console.log(`   Usuario: ${adminUser.username}`);
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Contraseña: admin123`);
        } else {
            console.log('ℹ️ Usuario admin ya existe:');
            console.log(`   Usuario: ${existingUser.username}`);
            console.log(`   Email: ${existingUser.email}`);
        }
    } catch (error) {
        console.error('❌ Error al crear usuario admin:', error.message);
        if (error.errors) {
            error.errors.forEach(e => {
                console.error(`  - ${e.path}: ${e.message}`);
            });
        }
    }
}

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Sincronizar modelos
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');
        
        // Crear áreas por defecto
        await createDefaultAreas();
        
        // Crear usuario admin
        await createAdminUser();
        
        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
            console.log(`📚 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;