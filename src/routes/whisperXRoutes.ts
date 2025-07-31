import { Router } from 'express';
import { WhisperXController } from '../controllers/whisperXController';

const router = Router();
const whisperXController = new WhisperXController();

// Ruta para transcribir audio con WhisperX
router.post('/transcribe', 
  whisperXController.uploadMiddleware,
  whisperXController.transcribeAudio
);

// Ruta para verificar disponibilidad de WhisperX
router.get('/availability', whisperXController.checkAvailability);

// Ruta para obtener información de modelos
router.get('/models/:model?', whisperXController.getModelInfo);

// Ruta de debug para verificar configuración
router.get('/debug', whisperXController.debugConfig);

export default router; 