import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Access token required' },
      });
    }

    const secret = process.env.JWT_SECRET || 'vectorengine_jwt_secret_key_2026_change_in_prod';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: 'user' | 'admin'; name: string };

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or expired token' },
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const secret = process.env.JWT_SECRET || 'vectorengine_jwt_secret_key_2026_change_in_prod';
      const decoded = jwt.verify(token, secret) as any;
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Admin access required for this endpoint' },
    });
  }
  next();
};
