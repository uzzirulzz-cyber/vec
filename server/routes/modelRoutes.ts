import { Router } from 'express';
import { getModels, createModel, updateModel, deleteModel, testModel } from '../controllers/modelController';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', optionalAuth, asyncHandler(getModels));
router.post('/', authenticateToken, requireAdmin, asyncHandler(createModel));
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(updateModel));
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(deleteModel));
router.post('/test', authenticateToken, requireAdmin, asyncHandler(testModel));

export default router;
