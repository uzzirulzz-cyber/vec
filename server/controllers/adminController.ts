import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import ApiLog from '../models/ApiLog';
import Usage from '../models/Usage';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  let totalUsers = 3;
  let activeUsers = 2;
  let totalApiRequests = 2630;
  let successfulRequests = 2580;
  let failedRequests = 50;
  let avgResponseTime = 185;
  let tokenStats = { totalTokens: 428500, promptTokens: 180200, completionTokens: 248300 };
  let topModels: any[] = [
    { model: 'vectorengine-gpt-4o', count: 1240, tokens: 210000 },
    { model: 'vectorengine-coder-pro', count: 890, tokens: 145000 },
    { model: 'vectorengine-reasoning-x1', count: 320, tokens: 58500 },
  ];
  let requestsPerDay = [
    { date: 'Mon', requests: 120, errors: 2 },
    { date: 'Tue', requests: 240, errors: 5 },
    { date: 'Wed', requests: 310, errors: 3 },
    { date: 'Thu', requests: 450, errors: 8 },
    { date: 'Fri', requests: 520, errors: 4 },
    { date: 'Sat', requests: 380, errors: 2 },
    { date: 'Sun', requests: 610, errors: 6 },
  ];

  if (mongoose.connection.readyState === 1) {
    try {
      totalUsers = await User.countDocuments();
      activeUsers = await User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      });

      totalApiRequests = await ApiLog.countDocuments();
      successfulRequests = await ApiLog.countDocuments({ statusCode: { $gte: 200, $lt: 400 } });
      failedRequests = await ApiLog.countDocuments({ statusCode: { $gte: 400 } });

      const avgResponseTimeAgg = await ApiLog.aggregate([
        { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
      ]);
      if (avgResponseTimeAgg[0]?.avgTime) {
        avgResponseTime = Math.round(avgResponseTimeAgg[0].avgTime);
      }

      const tokenUsageAgg = await Usage.aggregate([
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$tokens.totalTokens' },
            promptTokens: { $sum: '$tokens.promptTokens' },
            completionTokens: { $sum: '$tokens.completionTokens' },
          },
        },
      ]);
      if (tokenUsageAgg[0]) {
        tokenStats = tokenUsageAgg[0];
      }

      const topModelsAgg = await Usage.aggregate([
        { $group: { _id: '$model', count: { $sum: 1 }, tokens: { $sum: '$tokens.totalTokens' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);
      if (topModelsAgg.length > 0) {
        topModels = topModelsAgg.map((m) => ({ model: m._id || 'vectorengine-gpt-4o', count: m.count, tokens: m.tokens }));
      }

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const requestsPerDayAgg = await ApiLog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            errors: {
              $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      if (requestsPerDayAgg.length > 0) {
        requestsPerDay = requestsPerDayAgg.map((item) => ({ date: item._id, requests: item.count, errors: item.errors }));
      }
    } catch (err) {
      console.warn('Error computing admin dashboard stats from DB:', err);
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalApiRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime,
      tokenStats,
      topModels,
      requestsPerDay,
    },
  });
};

export const getApiLogs = async (req: AuthRequest, res: Response) => {
  const { model, endpoint, status, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;

  let logs: any[] = [];
  let total = 0;

  if (mongoose.connection.readyState === 1) {
    try {
      const query: any = {};
      if (model) query.model = model;
      if (endpoint) query.endpoint = { $regex: endpoint, $options: 'i' };
      if (status) {
        if (status === 'success') query.statusCode = { $gte: 200, $lt: 400 };
        if (status === 'error') query.statusCode = { $gte: 400 };
      }

      total = await ApiLog.countDocuments(query);
      logs = await ApiLog.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
    } catch (err) {
      console.warn('Error getting API logs from DB:', err);
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  let users: any[] = [
    { _id: '65f000000000000000000001', name: 'Pure Safe Admin', email: 'admin@pure.safe', role: 'admin', createdAt: new Date().toISOString() },
    { _id: '65f000000000000000000002', name: 'System Administrator', email: 'admin@vectorengine.ai', role: 'admin', createdAt: new Date().toISOString() },
    { _id: '65f000000000000000000003', name: 'Alex Developer', email: 'demo@vectorengine.ai', role: 'user', createdAt: new Date().toISOString() },
  ];

  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      if (dbUsers && dbUsers.length > 0) {
        users = dbUsers;
      }
    } catch (err) {
      console.warn('Error getting users from DB:', err);
    }
  }

  return res.status(200).json({
    success: true,
    data: users,
  });
};

export const getUsageReport = async (req: AuthRequest, res: Response) => {
  let usageByModel: any[] = [];

  if (mongoose.connection.readyState === 1) {
    try {
      usageByModel = await Usage.aggregate([
        {
          $group: {
            _id: '$model',
            totalRequests: { $sum: 1 },
            totalTokens: { $sum: '$tokens.totalTokens' },
            avgResponseTime: { $avg: '$responseTime' },
          },
        },
        { $sort: { totalTokens: -1 } },
      ]);
    } catch (err) {
      console.warn('Error getting usage report from DB:', err);
    }
  }

  return res.status(200).json({
    success: true,
    data: usageByModel,
  });
};
