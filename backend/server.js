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
 * Crear áreas por defecto con UUIDs fijos
 */
async function createDefaultAreas() {
    const areas = [
        { id: '11111111-1111-1111-1111-111111111111', code: 'DG', name: 'Dirección General' },
        { id: '22222222-2222-2222-2222-222222222222', code: 'DAJ', name: 'Dirección de Asuntos Jurídicos' },
        { id: '33333333-3333-3333-3333-333333333333', code: 'DA', name: 'Dirección de Archivos' },
        { id: '44444444-4444-4444-4444-444444444444', code: 'DT', name: 'Dirección de Transparencia' },
        { id: '55555555-5555-5555-5555-555555555555', code: 'AC', name: 'Atención Ciudadana' },
        { id: '66666666-6666-6666-6666-666666666666', code: 'DF', name: 'Dirección de Finanzas' },
        { id: '77777777-7777-7777-7777-777777777777', code: 'DRH', name: 'Dirección de Recursos Humanos' },
        { id: '88888888-8888-8888-8888-888888888888', code: 'DTI', name: 'Dirección de Tecnologías' },
        { id: '99999999-9999-9999-9999-999999999999', code: 'DCO', name: 'Dirección de Comunicación' },
        { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', code: 'DP', name: 'Dirección de Planeación' }
    ];

    try {
        console.log('🔍 Verificando áreas existentes...');
        
        // Verificar si la tabla de áreas existe
        let existingAreasCount = 0;
        let areasList = [];
        try {
            existingAreasCount = await Area.count();
            if (existingAreasCount > 0) {
                areasList = await Area.findAll({ 
                    attributes: ['id', 'code', 'name'],
                    order: [['code', 'ASC']]
                });
            }
        } catch (err) {
            console.log('⚠️ La tabla de áreas aún no existe. Se creará al sincronizar.');
        }
        
        console.log(`📊 Áreas existentes: ${existingAreasCount}`);

        if (existingAreasCount === 0) {
            console.log('📝 Creando áreas por defecto con UUIDs fijos...');
            let createdCount = 0;
            
            for (const areaData of areas) {
                try {
                    const [area, created] = await Area.findOrCreate({
                        where: { code: areaData.code },
                        defaults: {
                            id: areaData.id,
                            name: areaData.name,
                            description: `${areaData.name} - Área del Sistema de Control de Correspondencia`
                        }
                    });
                    if (created) {
                        createdCount++;
                        console.log(`✅ Área creada: ${area.code} - ${area.name} (ID: ${area.id})`);
                    } else {
                        console.log(`ℹ️ Área ya existe: ${area.code} - ${area.name} (ID: ${area.id})`);
                    }
                } catch (err) {
                    console.error(`❌ Error al crear área ${areaData.code}:`, err.message);
                }
            }
            console.log(`✅ ${createdCount} áreas creadas correctamente`);
        } else {
            console.log(`ℹ️ Ya existen ${existingAreasCount} áreas en la base de datos.`);
            console.log('📋 Lista de áreas existentes:');
            areasList.forEach(a => console.log(`   - ${a.code}: ${a.name} (ID: ${a.id})`));
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
        
        // Sincronizar modelos (alter: true para actualizar sin eliminar datos)
        await sequelize.sync({ alter: true });
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