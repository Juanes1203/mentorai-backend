import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Importar rutas
import classRoutes from './routes/classRoutes';
import whisperXRoutes from './routes/whisperXRoutes';
import authRoutes from './routes/authRoutes';
// import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const dbConnected = await testConnection();
    res.json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking database connection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/whisperx', whisperXRoutes);
// app.use('/api/users', userRoutes);

// Middleware de manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    await testConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

startServer();

export default app; 