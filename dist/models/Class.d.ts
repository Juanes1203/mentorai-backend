export interface Class {
    id?: string;
    name: string;
    teacher: string;
    created_at?: Date;
    updated_at?: Date;
    status?: 'active' | 'inactive';
    description?: string;
    subject?: string;
    grade_level?: string;
    duration?: number;
    recording_url?: string;
    transcript?: string;
    analysis_data?: string;
}
export declare class ClassModel {
    static getAll(): Promise<Class[]>;
    static getById(id: string): Promise<Class | null>;
    static create(classData: Class): Promise<string>;
    static update(id: string, classData: Partial<Class>): Promise<boolean>;
    static delete(id: string): Promise<boolean>;
    static search(searchTerm: string): Promise<Class[]>;
    static updateRecordingUrl(id: string, recordingUrl: string): Promise<boolean>;
    static updateTranscript(id: string, transcript: string): Promise<boolean>;
    static updateAnalysisData(id: string, analysisData: string): Promise<boolean>;
}
//# sourceMappingURL=Class.d.ts.map