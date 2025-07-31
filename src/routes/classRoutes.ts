import { Router } from 'express';
import { ClassController } from '../controllers/classController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rutas para clases (protegidas con autenticación)
router.get('/', authenticateToken, ClassController.getAllClasses);
router.get('/search', authenticateToken, ClassController.searchClasses);
router.get('/:id', authenticateToken, ClassController.getClassById);
router.post('/', authenticateToken, ClassController.createClass);
router.put('/:id', authenticateToken, ClassController.updateClass);
router.delete('/:id', authenticateToken, ClassController.deleteClass);

// Rutas específicas para funcionalidades de MentorAI
router.put('/:id/recording', ClassController.updateRecordingUrl);
router.put('/:id/transcript', ClassController.updateTranscript);
router.put('/:id/analysis', ClassController.updateAnalysisData);

export default router; 