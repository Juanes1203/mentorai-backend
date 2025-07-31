import { query } from '../config/database';

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
  duration?: number; // en minutos
  recording_url?: string;
  transcript?: string;
  analysis_data?: string; // JSON string
}

export class ClassModel {
  // Obtener todas las clases
  static async getAll(): Promise<Class[]> {
    const sql = `
      SELECT * FROM classes 
      ORDER BY created_at DESC
    `;
    return await query(sql) as Class[];
  }

  // Obtener clases por profesor
  static async getByTeacher(teacherName: string): Promise<Class[]> {
    const sql = `
      SELECT * FROM classes 
      WHERE teacher = ?
      ORDER BY created_at DESC
    `;
    return await query(sql, [teacherName]) as Class[];
  }

  // Obtener una clase por ID
  static async getById(id: string): Promise<Class | null> {
    const sql = `
      SELECT * FROM classes 
      WHERE id = ?
    `;
    const result = await query(sql, [id]) as Class[];
    return result.length > 0 ? result[0] : null;
  }

  // Crear una nueva clase
  static async create(classData: Class): Promise<string> {
    const sql = `
      INSERT INTO classes (id, name, teacher, description, subject, grade_level, duration, status, created_at, updated_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await query(sql, [
      classData.name,
      classData.teacher,
      classData.description || null,
      classData.subject || null,
      classData.grade_level || null,
      classData.duration || null,
      classData.status || 'active'
    ]) as any;
    
    return result.insertId;
  }

  // Actualizar una clase
  static async update(id: string, classData: Partial<Class>): Promise<boolean> {
    const sql = `
      UPDATE classes 
      SET name = ?, teacher = ?, description = ?, subject = ?, 
          grade_level = ?, duration = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await query(sql, [
      classData.name,
      classData.teacher,
      classData.description || null,
      classData.subject || null,
      classData.grade_level || null,
      classData.duration || null,
      classData.status || 'active',
      id
    ]) as any;
    
    return result.affectedRows > 0;
  }

  // Eliminar una clase
  static async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM classes WHERE id = ?`;
    const result = await query(sql, [id]) as any;
    return result.affectedRows > 0;
  }

  // Buscar clases por nombre o profesor
  static async search(searchTerm: string): Promise<Class[]> {
    const sql = `
      SELECT * FROM classes 
      WHERE name LIKE ? OR teacher LIKE ?
      ORDER BY created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    return await query(sql, [searchPattern, searchPattern]) as Class[];
  }

  // Actualizar URL de grabación
  static async updateRecordingUrl(id: string, recordingUrl: string): Promise<boolean> {
    const sql = `
      UPDATE classes 
      SET recording_url = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await query(sql, [recordingUrl, id]) as any;
    return result.affectedRows > 0;
  }

  // Actualizar transcripción
  static async updateTranscript(id: string, transcript: string): Promise<boolean> {
    const sql = `
      UPDATE classes 
      SET transcript = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await query(sql, [transcript, id]) as any;
    return result.affectedRows > 0;
  }

  // Actualizar datos de análisis
  static async updateAnalysisData(id: string, analysisData: string): Promise<boolean> {
    const sql = `
      UPDATE classes 
      SET analysis_data = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await query(sql, [analysisData, id]) as any;
    return result.affectedRows > 0;
  }
} 