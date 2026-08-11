import { Router } from 'express';
import { getDashboardStats, getApiLogs, getUsers, getUsageReport } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/dashboard', asyncHandler(getDashboardStats));
router.get('/logs', asyncHandler(getApiLogs));
router.get('/users', asyncHandler(getUsers));
router.get('/usage', asyncHandler(getUsageReport));

export default router;
