import { Request, Response } from 'express';
export declare class WhisperXController {
    private whisperXService;
    constructor();
    uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    transcribeAudio: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    checkAvailability: (req: Request, res: Response) => Promise<void>;
    getModelInfo: (req: Request, res: Response) => Promise<void>;
    private formatTranscript;
    private formatTimestamp;
    private extractSpeakers;
    private analyzeParticipation;
    private cleanupFile;
    debugConfig: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=whisperXController.d.ts.map