import { Request, Response } from 'express';
import { ClassModel, Class } from '../models/Class';

export class ClassController {
  // Obtener todas las clases (filtradas por usuario si es profesor)
  static async getAllClasses(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      let classes;

      if (user && user.role === 'teacher') {
        // Si es profesor, solo obtener sus clases
        classes = await ClassModel.getByTeacher(user.name);
      } else if (user && user.role === 'admin') {
        // Si es admin, obtener todas las clases
        classes = await ClassModel.getAll();
      } else {
        // Si no hay usuario o es estudiante, obtener todas las clases
        classes = await ClassModel.getAll();
      }

      res.json({
        success: true,
        data: classes,
        count: classes.length
      });
    } catch (error) {
      console.error('Error getting classes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las clases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obtener una clase por ID
  static async getClassById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const classData = await ClassModel.getById(id);
      
      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        data: classData
      });
    } catch (error) {
      console.error('Error getting class by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la clase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Crear una nueva clase
  static async createClass(req: Request, res: Response) {
    try {
      const classData: Class = req.body;
      
      // Validaciones básicas
      if (!classData.name || !classData.teacher) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y profesor son requeridos'
        });
      }

      const classId = await ClassModel.create(classData);
      
      res.status(201).json({
        success: true,
        message: 'Clase creada exitosamente',
        data: { id: classId, ...classData }
      });
    } catch (error) {
      console.error('Error creating class:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la clase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar una clase
  static async updateClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: Partial<Class> = req.body;

      const success = await ClassModel.update(id, updateData);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Clase actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating class:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la clase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Eliminar una clase
  static async deleteClass(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await ClassModel.delete(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Clase eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la clase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Buscar clases
  static async searchClasses(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Término de búsqueda requerido'
        });
      }

      const classes = await ClassModel.search(q);
      
      res.json({
        success: true,
        data: classes,
        count: classes.length,
        searchTerm: q
      });
    } catch (error) {
      console.error('Error searching classes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar clases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar URL de grabación
  static async updateRecordingUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { recordingUrl } = req.body;

      if (!recordingUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL de grabación requerida'
        });
      }

      const success = await ClassModel.updateRecordingUrl(id, recordingUrl);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'URL de grabación actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating recording URL:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la URL de grabación',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar transcripción
  static async updateTranscript(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          message: 'Transcripción requerida'
        });
      }

      const success = await ClassModel.updateTranscript(id, transcript);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Transcripción actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error updating transcript:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la transcripción',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Actualizar datos de análisis
  static async updateAnalysisData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { analysisData } = req.body;

      if (!analysisData) {
        return res.status(400).json({
          success: false,
          message: 'Datos de análisis requeridos'
        });
      }

      const success = await ClassModel.updateAnalysisData(id, JSON.stringify(analysisData));
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Clase no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Datos de análisis actualizados exitosamente'
      });
    } catch (error) {
      console.error('Error updating analysis data:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar los datos de análisis',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 