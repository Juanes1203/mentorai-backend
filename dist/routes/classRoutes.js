"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controllers/classController");
const router = (0, express_1.Router)();
// Rutas para clases
router.get('/', classController_1.ClassController.getAllClasses);
router.get('/search', classController_1.ClassController.searchClasses);
router.get('/:id', classController_1.ClassController.getClassById);
router.post('/', classController_1.ClassController.createClass);
router.put('/:id', classController_1.ClassController.updateClass);
router.delete('/:id', classController_1.ClassController.deleteClass);
// Rutas específicas para funcionalidades de MentorAI
router.put('/:id/recording', classController_1.ClassController.updateRecordingUrl);
router.put('/:id/transcript', classController_1.ClassController.updateTranscript);
router.put('/:id/analysis', classController_1.ClassController.updateAnalysisData);
exports.default = router;
//# sourceMappingURL=classRoutes.js.map