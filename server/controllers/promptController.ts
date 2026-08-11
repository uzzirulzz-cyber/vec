import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import PromptTemplate from '../models/PromptTemplate';

export const getPrompts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  
  // Public prompts + user's private prompts
  const filter = userId
    ? { $or: [{ isPublic: true }, { createdBy: userId }] }
    : { isPublic: true };

  const prompts = await PromptTemplate.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: prompts,
  });
};

export const createPrompt = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const { name, category, prompt, model, isPublic } = req.body;

  if (!name || !prompt) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Prompt name and text are required' },
    });
  }

  const template = await PromptTemplate.create({
    name,
    category: category || 'Coding',
    prompt,
    model: model || 'vectorengine-gpt-4o',
    createdBy: req.user.id,
    isPublic: isPublic !== undefined ? isPublic : true,
  });

  return res.status(201).json({
    success: true,
    data: template,
  });
};

export const deletePrompt = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const prompt = await PromptTemplate.findOne({
    _id: req.params.id,
    $or: [{ createdBy: req.user.id }, { isPublic: false }],
  });

  if (!prompt && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this template' },
    });
  }

  await PromptTemplate.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Prompt template deleted successfully',
  });
};
