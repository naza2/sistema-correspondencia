// ============================================
// backend/server.js - Crear usuario admin automáticamente
// ============================================

const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

// Función para crear usuario admin
async function createAdminUser() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        const [user, created] = await User.findOrCreate({
            where: { email: 'admin@infodf.gob.mx' },
            defaults: {
                id: '11111111-1111-1111-1111-111111111111',
                firstName: 'Admin',
                lastName: 'Sistema',
                email: 'admin@infodf.gob.mx',
                password: hashedPassword,
                role: 'ADMIN',
                isActive: true
            }
        });
        
        if (created) {
            console.log('✅ Usuario admin creado: admin@infodf.gob.mx / admin123');
        } else {
            console.log('ℹ️ Usuario admin ya existe');
        }
    } catch (error) {
        console.error('❌ Error al crear usuario admin:', error.message);
    }
}

// Iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Sincronizar modelos
        await sequelize.sync();
        console.log('✅ Modelos sincronizados');
        
        // Crear usuario admin
        await createAdminUser();
        
        // Iniciar servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
            console.log(`📚 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
    }
};

startServer();