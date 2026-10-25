import { supabase } from './supabaseClient.js';
import { AISettings, ProjectData, HistoryItem, PairedVerse } from '../types/index.js';

const API_BASE = '/api';

/**
 * Retrieves the current session Bearer token from Supabase or localStorage.
 */
async function getAuthToken(): Promise<string> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return data.session.access_token;
    }
  }

  // Development sandbox fallback token
  const devToken = localStorage.getItem('faith_studio_dev_token') || 'dev-user-demo-token';
  return devToken;
}

/**
 * Generic JSON request wrapper
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMessage = `Request failed (${res.status})`;
    try {
      const errorJson = await res.json();
      errMessage = errorJson.message || errorJson.error || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // AI Settings
  async getAISettings(): Promise<AISettings> {
    return apiRequest<AISettings>('/ai-settings');
  },

  async saveAISettings(settings: {
    openaiApiKey?: string;
    geminiApiKey?: string;
    primaryProvider: 'openai' | 'gemini';
    fallbackProvider: 'openai' | 'gemini' | 'none';
    openaiModel: string;
    geminiModel: string;
  }) {
    return apiRequest<{ success: boolean; message: string }>('/ai-settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },

  async testAIConnection(provider: 'openai' | 'gemini', apiKey?: string) {
    return apiRequest<{
      provider: string;
      success: boolean;
      message: string;
      availableModels?: string[];
      errorCode?: string;
    }>('/ai-settings/test', {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey })
    });
  },

  async deleteAIProvider(provider: 'openai' | 'gemini') {
    return apiRequest<{ success: boolean; message: string }>(`/ai-settings/${provider}`, {
      method: 'DELETE'
    });
  },

  // Generation
  async generateThumbnailBrief(input: any) {
    return apiRequest<{
      success: boolean;
      data: any;
      meta: {
        provider: string;
        model: string;
        durationMs: number;
        fallbackUsed: boolean;
        fallbackReason?: string;
      };
    }>('/generate/thumbnail-brief', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async generateVerseCaption(input: {
    verseReference: string;
    verseText: string;
    language: string;
    topic: string;
  }) {
    return apiRequest<{
      success: boolean;
      data: {
        caption: string;
        prayer?: string;
        hashtags: string[];
      };
      meta: any;
    }>('/generate/verse-caption', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  async generateImage(prompt: string, aspectRatio: string, type: string) {
    return apiRequest<{
      success: boolean;
      imageUrl?: string;
      presetFallback?: boolean;
      preset?: string;
      provider?: string;
      model?: string;
      message?: string;
    }>('/generate/image', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspectRatio, type })
    });
  },

  async uploadAsset(file: File, assetType: 'logo' | 'subject') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assetType', assetType);

    return apiRequest<{ success: boolean; url: string; mimeType: string; size: number }>('/generate/upload-asset', {
      method: 'POST',
      body: formData
    });
  },

  async renderFinalImage(renderPayload: any) {
    return apiRequest<{
      success: boolean;
      dataUrl: string;
      dimensions: { width: number; height: number };
      sizeBytes: number;
    }>('/generate/render-final', {
      method: 'POST',
      body: JSON.stringify(renderPayload)
    });
  },

  // Verses
  async getVerses(topic?: string): Promise<{ success: boolean; count: number; data: PairedVerse[] }> {
    const query = topic ? `?topic=${encodeURIComponent(topic)}` : '';
    return apiRequest(`/verses${query}`);
  },

  async getRandomVerse(topic?: string, exclude?: string[]): Promise<{ success: boolean; data: PairedVerse }> {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (exclude && exclude.length > 0) params.append('exclude', exclude.join(','));
    return apiRequest(`/verses/random?${params.toString()}`);
  },

  async searchVerse(reference: string): Promise<{ success: boolean; data: PairedVerse }> {
    return apiRequest(`/verses/search?ref=${encodeURIComponent(reference)}`);
  },

  // Projects
  async getProjects(type?: string): Promise<{ success: boolean; data: ProjectData[] }> {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return apiRequest(`/projects${query}`);
  },

  async getProject(id: string): Promise<{ success: boolean; data: ProjectData }> {
    return apiRequest(`/projects/${id}`);
  },

  async saveProject(project: Partial<ProjectData>): Promise<{ success: boolean; data: ProjectData }> {
    if (project.id) {
      return apiRequest(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify(project)
      });
    }
    return apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/projects/${id}`, { method: 'DELETE' });
  },

  // Generation History
  async getHistory(): Promise<{ success: boolean; data: HistoryItem[] }> {
    return apiRequest('/history');
  }
};
