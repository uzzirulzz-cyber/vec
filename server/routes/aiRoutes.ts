import { Router } from 'express';
import { chatCompletion, streamChatCompletion, generateImage, analyzeVision } from '../controllers/aiController';
import { optionalAuth } from '../middleware/authMiddleware';
import { uploadImage } from '../middleware/uploadMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/chat', optionalAuth, asyncHandler(chatCompletion));
router.post('/chat/stream', optionalAuth, asyncHandler(streamChatCompletion));
router.post('/image', optionalAuth, asyncHandler(generateImage));
router.post('/vision', optionalAuth, uploadImage.single('image'), asyncHandler(analyzeVision));

export default router;
