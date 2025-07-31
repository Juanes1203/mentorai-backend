import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface WhisperXConfig {
  model?: string;
  language?: string;
  compute_type?: string;
  batch_size?: number;
  diarize?: boolean;
  min_speakers?: number;
  max_speakers?: number;
}

interface TranscriptionResult {
  segments: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
    words?: Array<{
      start: number;
      end: number;
      word: string;
      speaker?: string;
    }>;
  }>;
  language: string;
  duration: number;
}

export class WhisperXService {
  private pythonPath: string;
  private whisperXPath: string;

  constructor() {
    // Configurar rutas - ajustar según tu instalación
    this.pythonPath = process.env.PYTHON_PATH || '/Users/juanes/Desktop/mentorai-virtual-teacher/whisperx-env/bin/python3';
    this.whisperXPath = process.env.WHISPERX_PATH || '/Users/juanes/Desktop/mentorai-virtual-teacher/whisperx-env/bin/whisperx';
  }

  async transcribeAudio(
    audioFilePath: string,
    config: WhisperXConfig = {}
  ): Promise<TranscriptionResult> {
    try {
      // Verificar que el archivo existe
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      // Configuración por defecto
      const defaultConfig = {
        model: 'base',
        language: 'es',
        compute_type: 'int8',
        batch_size: 8,
        diarize: false,
        min_speakers: 1,
        max_speakers: 2,
        ...config
      };

      // Crear directorio temporal para resultados
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'whisperx-'));
      const outputPath = path.join(tempDir, 'transcription.json');

      // Construir comando WhisperX
      const args = [
        audioFilePath,
        '--model', defaultConfig.model,
        '--language', defaultConfig.language,
        '--compute_type', defaultConfig.compute_type,
        '--batch_size', defaultConfig.batch_size.toString(),
        '--output_dir', tempDir,
        '--output_format', 'json'
      ];

                  // Agregar opciones de diarización si está habilitada
            if (defaultConfig.diarize) {
              args.push('--diarize');
              args.push('--min_speakers', defaultConfig.min_speakers.toString());
              args.push('--max_speakers', defaultConfig.max_speakers.toString());
              
              // Agregar token de Hugging Face si está disponible
              const hfToken = process.env.HUGGING_FACE_TOKEN;
              if (hfToken) {
                args.push('--hf_token', hfToken);
                console.log('Using Hugging Face token for diarization');
              } else {
                console.log('No Hugging Face token found, diarization may fail');
              }
            }

                  console.log(`Executing WhisperX with args: ${args.join(' ')}`);
            console.log(`WhisperX path: ${this.whisperXPath}`);
            console.log(`Python path: ${this.pythonPath}`);
            console.log(`Working directory: ${tempDir}`);
            console.log(`Environment variables:`, {
              PYTHON_PATH: process.env.PYTHON_PATH,
              WHISPERX_PATH: process.env.WHISPERX_PATH,
              PATH: process.env.PATH
            });

      // Ejecutar WhisperX
      const result = await this.executeWhisperX(args, tempDir);

      // Leer y procesar resultados
      const transcriptionData = this.readTranscriptionResult(tempDir, audioFilePath);
      
      // Limpiar archivos temporales
      this.cleanupTempFiles(tempDir);

      return transcriptionData;
    } catch (error) {
      console.error('Error in WhisperX transcription:', error);
      throw new Error(`WhisperX transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeWhisperX(args: string[], workingDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.whisperXPath, args, {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('WhisperX stdout:', data.toString());
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('WhisperX stderr:', data.toString());
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`WhisperX process exited with code ${code}. Stderr: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to start WhisperX process: ${error.message}`));
      });
    });
  }

  private readTranscriptionResult(tempDir: string, originalAudioPath: string): TranscriptionResult {
    // WhisperX genera varios archivos, necesitamos encontrar el correcto
    const baseName = path.basename(originalAudioPath, path.extname(originalAudioPath));
    const possibleFiles = [
      path.join(tempDir, `${baseName}.json`),
      path.join(tempDir, 'transcription.json'),
      path.join(tempDir, 'segments.json')
    ];

    let transcriptionFile = '';
    for (const file of possibleFiles) {
      if (fs.existsSync(file)) {
        transcriptionFile = file;
        break;
      }
    }

    if (!transcriptionFile) {
      throw new Error('Transcription result file not found');
    }

    const rawData = JSON.parse(fs.readFileSync(transcriptionFile, 'utf8'));
    return this.processWhisperXOutput(rawData);
  }

  private processWhisperXOutput(rawData: any): TranscriptionResult {
    // Procesar la salida de WhisperX según su formato
    const segments = rawData.segments?.map((segment: any) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
      speaker: segment.speaker,
      words: segment.words?.map((word: any) => ({
        start: word.start,
        end: word.end,
        word: word.word,
        speaker: word.speaker
      }))
    })) || [];

    return {
      segments,
      language: rawData.language || 'unknown',
      duration: rawData.duration || 0
    };
  }

  private cleanupTempFiles(tempDir: string): void {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }

  // Método para verificar si WhisperX está disponible
  async checkWhisperXAvailability(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      await execAsync(`${this.whisperXPath} --version`);
      return true;
    } catch (error) {
      console.warn('WhisperX not available:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // Método para obtener información del modelo
  async getModelInfo(model: string = 'large-v2'): Promise<any> {
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      const { stdout } = await execAsync(`${this.whisperXPath} --model ${model} --help`);
      return { available: true, info: stdout };
    } catch (error) {
      return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 