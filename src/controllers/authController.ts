import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario en la base de datos
    const users = await query(
      'SELECT * FROM users WHERE email = ? AND status = "active"',
      [email]
    ) as any[];

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // En una implementación más robusta, podrías invalidar el token
    // Por ahora, simplemente respondemos con éxito
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    // El middleware authenticateToken ya verificó el token
    // Solo necesitamos devolver la información del usuario
    const user = (req as any).user;
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}; 