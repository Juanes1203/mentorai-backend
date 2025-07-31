"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhisperXController = void 0;
const whisperXService_1 = require("../services/whisperXService");
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
// Configurar multer para subida de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(os.tmpdir(), 'whisperx-uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        // Solo permitir archivos de audio
        const allowedTypes = [
            'audio/wav',
            'audio/mp3',
            'audio/mpeg',
            'audio/ogg',
            'audio/webm',
            'audio/m4a',
            'audio/flac'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Solo se permiten archivos de audio'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB máximo
    }
});
class WhisperXController {
    constructor() {
        // Middleware para manejar la subida de archivos
        this.uploadMiddleware = upload.single('audio');
        // Transcribir audio con WhisperX
        this.transcribeAudio = async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        error: 'No se proporcionó archivo de audio'
                    });
                }
                console.log('Processing audio file:', req.file.originalname);
                // Obtener configuración de la request
                const config = {
                    model: req.body.model || 'base',
                    language: req.body.language || 'es',
                    compute_type: req.body.compute_type || 'int8',
                    batch_size: req.body.batch_size ? parseInt(req.body.batch_size) : 8,
                    diarize: req.body.diarize === 'true' || true,
                    min_speakers: req.body.min_speakers ? parseInt(req.body.min_speakers) : 1,
                    max_speakers: req.body.max_speakers ? parseInt(req.body.max_speakers) : 5
                };
                console.log('WhisperX config:', config);
                // Transcribir el audio
                const result = await this.whisperXService.transcribeAudio(req.file.path, config);
                // Limpiar archivo temporal
                this.cleanupFile(req.file.path);
                // Formatear respuesta
                const formattedTranscript = this.formatTranscript(result.segments);
                const participationAnalysis = this.analyzeParticipation(result.segments);
                const responseData = {
                    success: true,
                    data: {
                        transcript: formattedTranscript,
                        segments: result.segments,
                        speakers: this.extractSpeakers(result.segments),
                        language: result.language,
                        duration: result.duration,
                        participation: participationAnalysis
                    }
                };
                console.log('Sending response to frontend:', JSON.stringify(responseData, null, 2));
                res.json(responseData);
            }
            catch (error) {
                console.error('Error in transcription:', error);
                // Limpiar archivo en caso de error
                if (req.file) {
                    this.cleanupFile(req.file.path);
                }
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error interno del servidor'
                });
            }
        };
        // Verificar disponibilidad de WhisperX
        this.checkAvailability = async (req, res) => {
            try {
                const isAvailable = await this.whisperXService.checkWhisperXAvailability();
                res.json({
                    success: true,
                    data: {
                        available: isAvailable,
                        timestamp: new Date().toISOString()
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al verificar disponibilidad'
                });
            }
        };
        // Obtener información de modelos disponibles
        this.getModelInfo = async (req, res) => {
            try {
                const model = req.params.model || 'large-v2';
                const info = await this.whisperXService.getModelInfo(model);
                res.json({
                    success: true,
                    data: info
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al obtener información del modelo'
                });
            }
        };
        // Endpoint de debug para verificar configuración
        this.debugConfig = async (req, res) => {
            try {
                res.json({
                    success: true,
                    data: {
                        whisperXPath: this.whisperXService['whisperXPath'],
                        pythonPath: this.whisperXService['pythonPath'],
                        environment: {
                            PYTHON_PATH: process.env.PYTHON_PATH,
                            WHISPERX_PATH: process.env.WHISPERX_PATH,
                            NODE_ENV: process.env.NODE_ENV
                        }
                    }
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Error al obtener configuración'
                });
            }
        };
        this.whisperXService = new whisperXService_1.WhisperXService();
    }
    // Métodos privados de ayuda
    formatTranscript(segments) {
        return segments
            .map(segment => {
            const timestamp = this.formatTimestamp(segment.start);
            const speaker = segment.speaker ? `[${segment.speaker}]` : '';
            return `${speaker} [${timestamp}]: ${segment.text}`;
        })
            .join('\n\n');
    }
    formatTimestamp(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    extractSpeakers(segments) {
        const speakerMap = new Map();
        segments.forEach(segment => {
            if (segment.speaker) {
                const existing = speakerMap.get(segment.speaker);
                if (existing) {
                    existing.count++;
                    existing.totalConfidence += 0.8;
                }
                else {
                    speakerMap.set(segment.speaker, { count: 1, totalConfidence: 0.8 });
                }
            }
        });
        return Array.from(speakerMap.entries()).map(([id, data]) => ({
            id,
            type: data.count > 5 ? 'professor' : 'student',
            confidence: data.totalConfidence / data.count
        }));
    }
    analyzeParticipation(segments) {
        const speakerStats = {};
        const interactions = [];
        segments.forEach((segment, index) => {
            const speaker = segment.speaker || 'unknown';
            const duration = segment.end - segment.start;
            const wordCount = segment.text.split(' ').length;
            // Actualizar estadísticas del hablante
            if (!speakerStats[speaker]) {
                speakerStats[speaker] = { time: 0, segments: 0, words: 0 };
            }
            speakerStats[speaker].time += duration;
            speakerStats[speaker].segments += 1;
            speakerStats[speaker].words += wordCount;
            // Rastrear interacciones
            if (index > 0) {
                const previousSpeaker = segments[index - 1].speaker || 'unknown';
                const interaction = interactions.find(i => i.from === previousSpeaker && i.to === speaker);
                if (interaction) {
                    interaction.count++;
                }
                else {
                    interactions.push({ from: previousSpeaker, to: speaker, count: 1 });
                }
            }
        });
        const totalTime = segments.reduce((total, segment) => total + (segment.end - segment.start), 0);
        return {
            totalTime,
            speakerStats,
            interactionPatterns: interactions
        };
    }
    cleanupFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.warn('Failed to cleanup file:', filePath, error);
        }
    }
}
exports.WhisperXController = WhisperXController;
//# sourceMappingURL=whisperXController.js.map