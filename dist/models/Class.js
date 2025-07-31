"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassModel = void 0;
const database_1 = require("../config/database");
class ClassModel {
    // Obtener todas las clases
    static async getAll() {
        const sql = `
      SELECT * FROM classes 
      ORDER BY created_at DESC
    `;
        return await (0, database_1.query)(sql);
    }
    // Obtener una clase por ID
    static async getById(id) {
        const sql = `
      SELECT * FROM classes 
      WHERE id = ?
    `;
        const result = await (0, database_1.query)(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }
    // Crear una nueva clase
    static async create(classData) {
        const sql = `
      INSERT INTO classes (id, name, teacher, description, subject, grade_level, duration, status, created_at, updated_at)
      VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
        const result = await (0, database_1.query)(sql, [
            classData.name,
            classData.teacher,
            classData.description || null,
            classData.subject || null,
            classData.grade_level || null,
            classData.duration || null,
            classData.status || 'active'
        ]);
        return result.insertId;
    }
    // Actualizar una clase
    static async update(id, classData) {
        const sql = `
      UPDATE classes 
      SET name = ?, teacher = ?, description = ?, subject = ?, 
          grade_level = ?, duration = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const result = await (0, database_1.query)(sql, [
            classData.name,
            classData.teacher,
            classData.description || null,
            classData.subject || null,
            classData.grade_level || null,
            classData.duration || null,
            classData.status || 'active',
            id
        ]);
        return result.affectedRows > 0;
    }
    // Eliminar una clase
    static async delete(id) {
        const sql = `DELETE FROM classes WHERE id = ?`;
        const result = await (0, database_1.query)(sql, [id]);
        return result.affectedRows > 0;
    }
    // Buscar clases por nombre o profesor
    static async search(searchTerm) {
        const sql = `
      SELECT * FROM classes 
      WHERE name LIKE ? OR teacher LIKE ?
      ORDER BY created_at DESC
    `;
        const searchPattern = `%${searchTerm}%`;
        return await (0, database_1.query)(sql, [searchPattern, searchPattern]);
    }
    // Actualizar URL de grabación
    static async updateRecordingUrl(id, recordingUrl) {
        const sql = `
      UPDATE classes 
      SET recording_url = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const result = await (0, database_1.query)(sql, [recordingUrl, id]);
        return result.affectedRows > 0;
    }
    // Actualizar transcripción
    static async updateTranscript(id, transcript) {
        const sql = `
      UPDATE classes 
      SET transcript = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const result = await (0, database_1.query)(sql, [transcript, id]);
        return result.affectedRows > 0;
    }
    // Actualizar datos de análisis
    static async updateAnalysisData(id, analysisData) {
        const sql = `
      UPDATE classes 
      SET analysis_data = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const result = await (0, database_1.query)(sql, [analysisData, id]);
        return result.affectedRows > 0;
    }
}
exports.ClassModel = ClassModel;
//# sourceMappingURL=Class.js.map