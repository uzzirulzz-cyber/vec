import { Request, Response } from 'express';
import Model from '../models/Model';
import vectorEngineService from '../services/vectorEngineService';
import { AuthRequest } from '../middleware/authMiddleware';

export const getModels = async (req: AuthRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin';
  const query = isAdmin ? {} : { enabled: true };
  const models = await Model.find(query).sort({ name: 1 });

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
