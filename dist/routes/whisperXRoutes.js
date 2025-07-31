"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whisperXController_1 = require("../controllers/whisperXController");
const router = (0, express_1.Router)();
const whisperXController = new whisperXController_1.WhisperXController();
// Ruta para transcribir audio con WhisperX
router.post('/transcribe', whisperXController.uploadMiddleware, whisperXController.transcribeAudio);
// Ruta para verificar disponibilidad de WhisperX
router.get('/availability', whisperXController.checkAvailability);
// Ruta para obtener información de modelos
router.get('/models/:model?', whisperXController.getModelInfo);
// Ruta de debug para verificar configuración
router.get('/debug', whisperXController.debugConfig);
exports.default = router;
//# sourceMappingURL=whisperXRoutes.js.map