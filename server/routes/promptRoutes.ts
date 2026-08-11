import { Router } from 'express';
import { getPrompts, createPrompt, deletePrompt } from '../controllers/promptController';
import { optionalAuth, authenticateToken } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', optionalAuth, asyncHandler(getPrompts));
router.post('/', authenticateToken, asyncHandler(createPrompt));
router.delete('/:id', authenticateToken, asyncHandler(deletePrompt));

export default router;
