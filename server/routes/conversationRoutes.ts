import { Router } from 'express';
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/conversationController';
import { authenticateToken } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticateToken);

router.get('/', asyncHandler(getConversations));
router.get('/:id', asyncHandler(getConversation));
router.post('/', asyncHandler(createConversation));
router.put('/:id', asyncHandler(updateConversation));
router.delete('/:id', asyncHandler(deleteConversation));

export default router;
