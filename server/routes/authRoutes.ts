import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authenticateToken, asyncHandler(getMe));

export default router;
