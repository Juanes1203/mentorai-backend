"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
// Importar rutas
const classRoutes_1 = __importDefault(require("./routes/classRoutes"));
const whisperXRoutes_1 = __importDefault(require("./routes/whisperXRoutes"));
// import userRoutes from './routes/userRoutes';
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'MentorAI Backend API',
        version: '1.0.0',
        status: 'running'
    });
});
// Ruta para probar la conexión a la base de datos
app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await (0, database_1.testConnection)();
        res.json({
            status: 'ok',
            database: dbConnected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error checking database connection',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Rutas de la API
app.use('/api/classes', classRoutes_1.default);
app.use('/api/whisperx', whisperXRoutes_1.default);
// app.use('/api/users', userRoutes);
// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});
// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        await (0, database_1.testConnection)();
        console.log('✅ Conexión a la base de datos establecida correctamente');
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
            console.log(`📊 API disponible en: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map