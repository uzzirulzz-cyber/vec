import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'vectorengine_jwt_secret_key_2026_change_in_prod';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required' },
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'An account with this email already exists' },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: 'user',
  });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    },
  });
};
