import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Model from '../models/Model';
import vectorEngineService from '../services/vectorEngineService';
import { AuthRequest } from '../middleware/authMiddleware';

const defaultModels = [
  {
    name: 'VectorEngine GPT-4o',
    modelId: 'vectorengine-gpt-4o',
    provider: 'VectorEngine',
    type: 'chat',
    capabilities: ['chat', 'reasoning', 'coding'],
    description: 'High-intelligence flagship model for complex chat, reasoning, and multi-turn coding tasks.',
    enabled: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  {
    name: 'VectorEngine Coder Pro',
    modelId: 'vectorengine-coder-pro',
    provider: 'VectorEngine',
    type: 'coding',
    capabilities: ['chat', 'coding', 'reasoning'],
    description: 'Specialized low-latency model optimized for code generation, code review, and architecture debugging.',
    enabled: true,
    maxTokens: 8192,
    contextWindow: 128000,
  },
  {
    name: 'VectorEngine Reasoning X1',
    modelId: 'vectorengine-reasoning-x1',
    provider: 'VectorEngine',
    type: 'reasoning',
    capabilities: ['chat', 'reasoning'],
    description: 'Deep chain-of-thought model engineered for logic puzzles, mathematical proofs, and analytical problems.',
    enabled: true,
    maxTokens: 4096,
    contextWindow: 64000,
  },
  {
    name: 'VectorEngine Vision Pro',
    modelId: 'vectorengine-vision-v1',
    provider: 'VectorEngine',
    type: 'vision',
    capabilities: ['chat', 'vision'],
    description: 'Multimodal vision model capable of analyzing diagrams, code screenshots, UI mockups, and complex images.',
    enabled: true,
    maxTokens: 4096,
    contextWindow: 128000,
  },
  {
    name: 'VectorEngine Imagine 3.0',
    modelId: 'vectorengine-dall-e-3',
    provider: 'VectorEngine',
    type: 'image',
    capabilities: ['image'],
    description: 'Next-gen text-to-image synthesis model generating ultra-photorealistic and creative artistic visual graphics.',
    enabled: true,
    maxTokens: 1,
    contextWindow: 2000,
  },
  {
    name: 'VectorEngine Embed Large',
    modelId: 'vectorengine-embed-large',
    provider: 'VectorEngine',
    type: 'embeddings',
    capabilities: ['embeddings'],
    description: 'High-density 1536-dimensional text embeddings model for RAG, semantic search, and document retrieval.',
    enabled: true,
    maxTokens: 512,
    contextWindow: 8192,
  },
];

export const getModels = async (req: AuthRequest, res: Response) => {
  let models: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const isAdmin = req.user?.role === 'admin';
      const query = isAdmin ? {} : { enabled: true };
      models = await Model.find(query).sort({ name: 1 });
    } catch (err) {
      console.warn('Error fetching models from DB:', err);
    }
  }

  if (!models || models.length === 0) {
    models = defaultModels;
  }

  return res.status(200).json({
    success: true,
    data: models,
  });
};

export const createModel = async (req: AuthRequest, res: Response) => {
  const { name, modelId, provider, type, capabilities, description, enabled, maxTokens, contextWindow } = req.body;

  if (!name || !modelId) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Model name and modelId are required' },
    });
  }

  const existing = await Model.findOne({ modelId });
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'MODEL_EXISTS', message: 'A model with this modelId already exists' },
    });
  }

  const model = await Model.create({
    name,
    modelId,
    provider: provider || 'VectorEngine',
    type: type || 'chat',
    capabilities: capabilities || ['chat'],
    description: description || '',
    enabled: enabled !== undefined ? enabled : true,
    maxTokens: maxTokens || 4096,
    contextWindow: contextWindow || 128000,
  });

  return res.status(201).json({
    success: true,
    data: model,
  });
};

export const updateModel = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const model = await Model.findByIdAndUpdate(id, updates, { new: true });
  if (!model) {
    return res.status(404).json({
      success: false,
      error: { code: 'MODEL_NOT_FOUND', message: 'Model not found' },
    });
  }

  return res.status(200).json({
    success: true,
    data: model,
  });
};

export const deleteModel = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const model = await Model.findByIdAndDelete(id);

  if (!model) {
    return res.status(404).json({
      success: false,
      error: { code: 'MODEL_NOT_FOUND', message: 'Model not found' },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Model deleted successfully',
  });
};

export const testModel = async (req: AuthRequest, res: Response) => {
  const { modelId, prompt } = req.body;

  const model = await Model.findOne({ modelId });
  if (!model) {
    return res.status(404).json({
      success: false,
      error: { code: 'MODEL_NOT_FOUND', message: 'Specified model was not found in catalog' },
    });
  }

  const testPrompt = prompt || 'Say hello and describe your architecture capabilities in 2 sentences.';
  
  if (model.type === 'image') {
    const result = await vectorEngineService.generateImage({
      model: model.modelId,
      prompt: testPrompt,
    });
    return res.status(200).json({ success: true, data: { result, type: 'image' } });
  }

  const result = await vectorEngineService.createChatCompletion({
    model: model.modelId,
    messages: [{ role: 'user', content: testPrompt }],
  });

  return res.status(200).json({
    success: true,
    data: { result, type: 'chat' },
  });
};
