import { Request, Response, NextFunction } from 'express';
import ApiLog from '../models/ApiLog';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorMiddleware = async (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const requestId = (req as any).requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  console.error(`[ERROR] [${requestId}] ${req.method} ${req.url} - ${statusCode}: ${message}`);

  // Log error to ApiLog if possible
  try {
    await ApiLog.create({
      userId: (req as any).user?.id,
      endpoint: req.originalUrl || req.url,
      statusCode,
      responseTime: Date.now() - ((req as any).startTime || Date.now()),
      requestId,
      error: `${errorCode}: ${message}`,
      ipAddress: req.ip,
    });
  } catch (logErr) {
    // Prevent logging failure from crashing response
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
    },
    requestId,
  });
};
