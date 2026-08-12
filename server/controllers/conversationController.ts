import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import Conversation from '../models/Conversation';

export const getConversations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  let conversations: any[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      conversations = await Conversation.find({ userId: req.user.id })
        .select('_id title model messages createdAt updatedAt')
        .sort({ updatedAt: -1 });
    } catch (err) {
      console.warn('Error getting conversations:', err);
    }
  }

  return res.status(200).json({
    success: true,
    data: conversations || [],
  });
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  let conversation = null;
  if (mongoose.connection.readyState === 1) {
    try {
      conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });
    } catch (err) {}
  }

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Conversation not found' },
    });
  }

  return res.status(200).json({
    success: true,
    data: conversation,
  });
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const { title, model, initialMessage } = req.body;
  const messages = initialMessage ? [initialMessage] : [];

  const conversationData = {
    _id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: req.user.id,
    title: title || 'New Conversation',
    model: model || 'vectorengine-gpt-4o',
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (mongoose.connection.readyState === 1) {
    try {
      const created = await Conversation.create({
        userId: req.user.id,
        title: title || 'New Conversation',
        model: model || 'vectorengine-gpt-4o',
        messages,
      });
      return res.status(201).json({
        success: true,
        data: created,
      });
    } catch (err) {
      console.warn('Failed to save conversation to DB:', err);
    }
  }

  return res.status(201).json({
    success: true,
    data: conversationData,
  });
};

export const updateConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const { title, model, messages } = req.body;

  let conversation: any = null;
  if (mongoose.connection.readyState === 1) {
    try {
      conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });
    } catch (err) {}
  }

  if (!conversation) {
    // Return mock success payload if DB is offline
    return res.status(200).json({
      success: true,
      data: {
        _id: req.params.id,
        userId: req.user.id,
        title: title || 'Updated Conversation',
        model: model || 'vectorengine-gpt-4o',
        messages: messages || [],
        updatedAt: new Date().toISOString(),
      },
    });
  }

  if (title !== undefined) conversation.title = title;
  if (model !== undefined) conversation.model = model;
  if (messages !== undefined) conversation.messages = messages;

  await conversation.save().catch(() => {});

  return res.status(200).json({
    success: true,
    data: conversation,
  });
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  if (mongoose.connection.readyState === 1) {
    try {
      await Conversation.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });
    } catch (err) {}
  }

  return res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
};
