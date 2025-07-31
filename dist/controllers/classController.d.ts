import { Request, Response } from 'express';
export declare class ClassController {
    static getAllClasses(req: Request, res: Response): Promise<void>;
    static getClassById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static createClass(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateClass(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteClass(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static searchClasses(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateRecordingUrl(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateTranscript(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateAnalysisData(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=classController.d.ts.map