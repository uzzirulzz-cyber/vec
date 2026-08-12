import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import vectorEngineService from '../services/vectorEngineService';
import Model from '../models/Model';
import Usage from '../models/Usage';
import ApiLog from '../models/ApiLog';

export const chatCompletion = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const { model: requestedModelId, messages, temperature, max_tokens } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETERS', message: 'Messages array is required' },
    });
  }

  const modelId = requestedModelId || process.env.VECTORENGINE_DEFAULT_MODEL || 'vectorengine-gpt-4o';
  
  let modelDoc = null;
  if (mongoose.connection.readyState === 1) {
    try {
      modelDoc = await Model.findOne({ modelId });
    } catch (err) {
      console.warn('DB lookup error for model:', err);
    }
  }

  if (modelDoc && !modelDoc.enabled) {
    return res.status(400).json({
      success: false,
      error: { code: 'MODEL_DISABLED', message: `Model ${modelId} is currently disabled by administrator` },
    });
  }

  if (modelDoc && !modelDoc.capabilities.includes('chat') && !modelDoc.capabilities.includes('coding') && !modelDoc.capabilities.includes('reasoning')) {
    return res.status(400).json({
      success: false,
      error: { code: 'UNSUPPORTED_CAPABILITY', message: `Model ${modelId} does not support chat operations` },
    });
  }

  try {
    const result = await vectorEngineService.createChatCompletion({
      model: modelId,
      messages,
      temperature,
      max_tokens,
    });

    const responseTime = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';

    if (mongoose.connection.readyState === 1) {
      // Track Usage & ApiLog in non-blocking background
      Usage.create({
        userId,
        model: modelId,
        endpoint: '/api/ai/chat',
        tokens: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens,
        },
        requestStatus: 'success',
        responseTime,
      }).catch(() => {});

      ApiLog.create({
        userId,
        endpoint: '/api/ai/chat',
        model: modelId,
        statusCode: 200,
        responseTime,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ipAddress: req.ip,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: {
        id: `chatcmpl_${Date.now()}`,
        model: modelId,
        message: {
          role: 'assistant',
          content: result.content,
        },
        usage: {
          prompt_tokens: result.promptTokens,
          completion_tokens: result.completionTokens,
          total_tokens: result.totalTokens,
        },
      },
    });
  } catch (err: any) {
    const responseTime = Date.now() - startTime;
    if (mongoose.connection.readyState === 1) {
      ApiLog.create({
        userId: req.user?.id,
        endpoint: '/api/ai/chat',
        model: modelId,
        statusCode: 500,
        responseTime,
        requestId: `req_${Date.now()}`,
        error: err.message,
      }).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      error: { code: 'AI_REQUEST_FAILED', message: err.message || 'Unable to process AI request' },
    });
  }
};

export const streamChatCompletion = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const { model: requestedModelId, messages, temperature, max_tokens } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETERS', message: 'Messages array is required' },
    });
  }

  const modelId = requestedModelId || process.env.VECTORENGINE_DEFAULT_MODEL || 'vectorengine-gpt-4o';
  
  let modelDoc = null;
  if (mongoose.connection.readyState === 1) {
    try {
      modelDoc = await Model.findOne({ modelId });
    } catch (err) {}
  }

  if (modelDoc && !modelDoc.enabled) {
    return res.status(400).json({
      success: false,
      error: { code: 'MODEL_DISABLED', message: `Model ${modelId} is currently disabled` },
    });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const result = await vectorEngineService.streamChatCompletion(
      { model: modelId, messages, temperature, max_tokens },
      (tokenChunk: string) => {
        res.write(`data: ${JSON.stringify({ token: tokenChunk, model: modelId })}\n\n`);
      }
    );

    res.write('data: [DONE]\n\n');
    res.end();

    const responseTime = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';

    if (mongoose.connection.readyState === 1) {
      Usage.create({
        userId,
        model: modelId,
        endpoint: '/api/ai/chat/stream',
        tokens: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.totalTokens,
        },
        requestStatus: 'success',
        responseTime,
      }).catch(() => {});

      ApiLog.create({
        userId,
        endpoint: '/api/ai/chat/stream',
        model: modelId,
        statusCode: 200,
        responseTime,
        requestId: `stream_${Date.now()}`,
        ipAddress: req.ip,
      }).catch(() => {});
    }
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err.message || 'Stream processing failed' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
};

export const generateImage = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const { model: requestedModelId, prompt, size } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PARAMETERS', message: 'Prompt text is required' },
    });
  }

  const modelId = requestedModelId || 'vectorengine-dall-e-3';
  let modelDoc = null;
  if (mongoose.connection.readyState === 1) {
    try {
      modelDoc = await Model.findOne({ modelId });
    } catch (err) {}
  }

  if (modelDoc && !modelDoc.enabled) {
    return res.status(400).json({
      success: false,
      error: { code: 'MODEL_DISABLED', message: `Image model ${modelId} is currently disabled` },
    });
  }

  if (modelDoc && !modelDoc.capabilities.includes('image')) {
    return res.status(400).json({
      success: false,
      error: { code: 'UNSUPPORTED_CAPABILITY', message: `Model ${modelId} does not support image generation` },
    });
  }

  try {
    const result = await vectorEngineService.generateImage({
      model: modelId,
      prompt,
      size,
    });

    const responseTime = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';

    if (mongoose.connection.readyState === 1) {
      Usage.create({
        userId,
        model: modelId,
        endpoint: '/api/ai/image',
        tokens: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        requestStatus: 'success',
        responseTime,
      }).catch(() => {});

      ApiLog.create({
        userId,
        endpoint: '/api/ai/image',
        model: modelId,
        statusCode: 200,
        responseTime,
        requestId: `img_${Date.now()}`,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: {
        url: result.url,
        prompt,
        model: modelId,
        size: size || '1024x1024',
        createdAt: new Date(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'IMAGE_GENERATION_FAILED', message: err.message },
    });
  }
};

export const analyzeVision = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();
  const file = req.file;
  const prompt = req.body.prompt || 'Analyze this image in detail.';
  const modelId = req.body.model || 'vectorengine-vision-v1';

  if (!file) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FILE', message: 'No image file uploaded' },
    });
  }

  let modelDoc = null;
  if (mongoose.connection.readyState === 1) {
    try {
      modelDoc = await Model.findOne({ modelId });
    } catch (err) {}
  }

  if (modelDoc && !modelDoc.capabilities.includes('vision')) {
    return res.status(400).json({
      success: false,
      error: { code: 'UNSUPPORTED_CAPABILITY', message: `Model ${modelId} does not support vision capability` },
    });
  }

  try {
    const result = await vectorEngineService.analyzeVision({
      model: modelId,
      prompt,
      imageBuffer: file.buffer,
      imageMimeType: file.mimetype,
    });

    const responseTime = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';

    if (mongoose.connection.readyState === 1) {
      Usage.create({
        userId,
        model: modelId,
        endpoint: '/api/ai/vision',
        tokens: { promptTokens: 200, completionTokens: 300, totalTokens: 500 },
        requestStatus: 'success',
        responseTime,
      }).catch(() => {});

      ApiLog.create({
        userId,
        endpoint: '/api/ai/vision',
        model: modelId,
        statusCode: 200,
        responseTime,
        requestId: `vis_${Date.now()}`,
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      data: {
        analysis: result.content,
        model: modelId,
        originalName: file.originalname,
        sizeBytes: file.size,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'VISION_ANALYSIS_FAILED', message: err.message },
    });
  }
};
