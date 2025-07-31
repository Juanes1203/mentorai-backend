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
export declare class WhisperXService {
    private pythonPath;
    private whisperXPath;
    constructor();
    transcribeAudio(audioFilePath: string, config?: WhisperXConfig): Promise<TranscriptionResult>;
    private executeWhisperX;
    private readTranscriptionResult;
    private processWhisperXOutput;
    private cleanupTempFiles;
    checkWhisperXAvailability(): Promise<boolean>;
    getModelInfo(model?: string): Promise<any>;
}
export {};
//# sourceMappingURL=whisperXService.d.ts.map