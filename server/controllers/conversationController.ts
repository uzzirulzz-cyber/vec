import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Conversation from '../models/Conversation';

export const getConversations = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const conversations = await Conversation.find({ userId: req.user.id })
    .select('_id title model messages createdAt updatedAt')
    .sort({ updatedAt: -1 });

  return res.status(200).json({
    success: true,
    data: conversations,
  });
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

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

  const conversation = await Conversation.create({
    userId: req.user.id,
    title: title || 'New Conversation',
    model: model || 'vectorengine-gpt-4o',
    messages,
  });

  return res.status(201).json({
    success: true,
    data: conversation,
  });
};

export const updateConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const { title, model, messages } = req.body;

  const conversation = await Conversation.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Conversation not found' },
    });
  }

  if (title !== undefined) conversation.title = title;
  if (model !== undefined) conversation.model = model;
  if (messages !== undefined) conversation.messages = messages;

  await conversation.save();

  return res.status(200).json({
    success: true,
    data: conversation,
  });
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
  }

  const conversation = await Conversation.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Conversation not found' },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully',
  });
};
