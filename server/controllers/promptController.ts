import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import PromptTemplate from '../models/PromptTemplate';

const defaultPrompts = [
  {
    _id: 'p1',
    name: 'Code Review & Refactor',
    category: 'Coding',
    prompt: 'Review the following code snippet for readability, efficiency, security vulnerabilities, and adherence to clean code principles:\n\n```\n// Insert code here\n```',
    model: 'vectorengine-coder-pro',
    isPublic: true,
  },
  {
    _id: 'p2',
    name: 'Executive Summary Generator',
    category: 'Business',
    prompt: 'Synthesize the provided text into a concise 3-paragraph executive summary with key takeaways and strategic action points:',
    model: 'vectorengine-gpt-4o',
    isPublic: true,
  },
  {
    _id: 'p3',
    name: 'Product Launch Marketing Copy',
    category: 'Marketing',
    prompt: 'Draft an engaging product launch email and 3 social media posts (X/LinkedIn) promoting a new developer tool.',
    model: 'vectorengine-gpt-4o',
    isPublic: true,
  },
  {
    _id: 'p4',
    name: 'Step-by-Step Architecture Guide',
    category: 'Research',
    prompt: 'Explain the internal mechanics of high-throughput message queues (e.g. Kafka vs RabbitMQ) for a senior systems engineer.',
    model: 'vectorengine-reasoning-x1',
    isPublic: true,
  },
];

export const getPrompts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  let prompts: any[] = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const filter = userId
        ? { $or: [{ isPublic: true }, { createdBy: userId }] }
        : { isPublic: true };

      prompts = await PromptTemplate.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (err) {
      console.warn('Error fetching prompts from DB:', err);
    }
  }

  if (!prompts || prompts.length === 0) {
    prompts = defaultPrompts;
  }

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

  const templateData = {
    _id: `prompt_${Date.now()}`,
    name,
    category: category || 'Coding',
    prompt,
    model: model || 'vectorengine-gpt-4o',
    createdBy: req.user.id,
    isPublic: isPublic !== undefined ? isPublic : true,
    createdAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
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
    } catch (err) {
      console.warn('Error saving prompt to DB:', err);
    }
  }

  return res.status(201).json({
    success: true,
    data: templateData,
  });
};

export const deletePrompt = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await PromptTemplate.findByIdAndDelete(req.params.id);
    } catch (err) {}
  }

  return res.status(200).json({
    success: true,
    message: 'Prompt template deleted successfully',
  });
};
