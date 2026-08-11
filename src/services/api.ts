import { User, Model, Conversation, PromptTemplate, ApiLog, AdminStats } from '../types';

const API_BASE = '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('vectorengine_token');
  const headers: Record<string, string> = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      const text = await res.text().catch(() => '');
      throw new Error(`Invalid JSON response (${res.status}): ${text.substring(0, 100)}`);
    }
  } else {
    const text = await res.text().catch(() => '');
    const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
    throw new Error(cleanText || `Server returned non-JSON response (${res.status} ${res.statusText})`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || `API Request failed (${res.status})`);
  }
  return data.data;
};

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
      return { status: 'error', message: `Server returned status ${res.status}` };
    } catch (err: any) {
      return { status: 'offline', message: err.message };
    }
  },

  // Auth
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Models
  getModels: async (): Promise<Model[]> => {
    const res = await fetch(`${API_BASE}/models`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createModel: async (modelData: Partial<Model>): Promise<Model> => {
    const res = await fetch(`${API_BASE}/models`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(modelData),
    });
    return handleResponse(res);
  },

  updateModel: async (id: string, modelData: Partial<Model>): Promise<Model> => {
    const res = await fetch(`${API_BASE}/models/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(modelData),
    });
    return handleResponse(res);
  },

  deleteModel: async (id: string) => {
    const res = await fetch(`${API_BASE}/models/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  testModel: async (modelId: string, prompt?: string) => {
    const res = await fetch(`${API_BASE}/models/test`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ modelId, prompt }),
    });
    return handleResponse(res);
  },

  // AI Inference
  chatCompletion: async (model: string, messages: any[], temperature = 0.7) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ model, messages, temperature }),
    });
    return handleResponse(res);
  },

  streamChat: async (
    model: string,
    messages: any[],
    onToken: (token: string) => void,
    onComplete: () => void,
    onError: (err: string) => void
  ) => {
    const token = localStorage.getItem('vectorengine_token');
    try {
      const response = await fetch(`${API_BASE}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!response.ok) {
        if (response.headers.get('content-type')?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Streaming request failed');
        } else {
          const text = await response.text().catch(() => '');
          const cleanText = text.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().substring(0, 150);
          throw new Error(cleanText || `Streaming request failed with status ${response.status}`);
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('ReadableStream not supported');

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.substring(6);
            if (dataStr === '[DONE]') {
              onComplete();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
              if (parsed.token) {
                onToken(parsed.token);
              }
            } catch (e) {
              // Ignore parse error on chunk boundary
            }
          }
        }
      }
      onComplete();
    } catch (err: any) {
      onError(err.message || 'Stream error');
    }
  },

  generateImage: async (model: string, prompt: string, size = '1024x1024') => {
    const res = await fetch(`${API_BASE}/ai/image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ model, prompt, size }),
    });
    return handleResponse(res);
  },

  analyzeVision: async (file: File, prompt: string, model = 'vectorengine-vision-v1') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('prompt', prompt);
    formData.append('model', model);

    const token = localStorage.getItem('vectorengine_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/vision`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse(res);
  },

  // Conversations
  getConversations: async (): Promise<Conversation[]> => {
    const res = await fetch(`${API_BASE}/conversations`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createConversation: async (title: string, model: string, initialMessage?: any): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, model, initialMessage }),
    });
    return handleResponse(res);
  },

  updateConversation: async (id: string, updates: { title?: string; model?: string; messages?: any[] }): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  deleteConversation: async (id: string) => {
    const res = await fetch(`${API_BASE}/conversations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Prompts
  getPrompts: async (): Promise<PromptTemplate[]> => {
    const res = await fetch(`${API_BASE}/prompts`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createPrompt: async (promptData: { name: string; category: string; prompt: string; model?: string; isPublic?: boolean }): Promise<PromptTemplate> => {
    const res = await fetch(`${API_BASE}/prompts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promptData),
    });
    return handleResponse(res);
  },

  deletePrompt: async (id: string) => {
    const res = await fetch(`${API_BASE}/prompts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  getAdminStats: async (): Promise<AdminStats> => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminModels: async (): Promise<Model[]> => {
    return api.getModels();
  },

  updateAdminModel: async (id: string, modelData: Partial<Model>): Promise<Model> => {
    return api.updateModel(id, modelData);
  },

  getAdminLogs: async (params?: { model?: string; endpoint?: string; status?: string; page?: number }): Promise<{ logs: ApiLog[]; pagination: any }> => {
    const query = new URLSearchParams();
    if (params?.model) query.append('model', params.model);
    if (params?.endpoint) query.append('endpoint', params.endpoint);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());

    const res = await fetch(`${API_BASE}/admin/logs?${query.toString()}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAdminUsage: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/usage`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
