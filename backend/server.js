// ============================================
// backend/server.js - Crear usuario admin automáticamente
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
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

// Función para crear usuario admin
async function createAdminUser() {
    try {
        // Verificar si el usuario admin existe por email
        const existingUser = await User.findOne({
            where: { email: 'admin@infodf.gob.mx' }
        });

        if (!existingUser) {
            // Crear usuario admin con el modelo correcto
            // La contraseña se hashea automáticamente con el hook beforeCreate
            const adminUser = await User.create({
                username: 'admin',
                email: 'admin@infodf.gob.mx',
                passwordHash: 'admin123', // Se hasheará automáticamente
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

// Iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Sincronizar modelos (con alter:true para desarrollo)
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');
        
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