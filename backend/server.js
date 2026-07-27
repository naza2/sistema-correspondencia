// ============================================
// server.js - Punto de entrada del Backend
// ============================================

const app = require('./src/config/app');
const { sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');

        // Sincronizar modelos (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ Modelos sincronizados');
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
            console.log(`📚 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();