export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  lastLogin?: string;
}

export interface Model {
  _id: string;
  name: string;
  modelId: string;
  provider: string;
  type: 'chat' | 'coding' | 'reasoning' | 'vision' | 'image' | 'video' | 'embeddings' | 'other';
  capabilities: string[];
  description: string;
  enabled: boolean;
  maxTokens?: number;
  contextWindow?: number;
  pricing?: { prompt?: number; completion?: number };
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
  timestamp?: string | Date;
}

export interface Conversation {
  _id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  _id: string;
  name: string;
  category: 'Coding' | 'Business' | 'Marketing' | 'Writing' | 'Research' | 'Analysis' | 'Other';
  prompt: string;
  model?: string;
  createdBy?: { _id: string; name: string; email: string };
  isPublic: boolean;
  createdAt?: string;
}

export interface ApiLog {
  _id: string;
  userId?: { name: string; email: string } | string;
  endpoint: string;
  model?: string;
  statusCode: number;
  responseTime: number;
  requestId: string;
  error?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalApiRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  tokenStats: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
  topModels: { model: string; count: number; tokens: number }[];
  requestsPerDay: { date: string; requests: number; errors: number }[];
}
