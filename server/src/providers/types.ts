export type ProviderName = 'openai' | 'gemini';

export type PriorityMode = 'openai' | 'gemini' | 'openai_only' | 'gemini_only';

export type TaskType = 
  | 'title_suggestions' 
  | 'caption_generation' 
  | 'prompt_enhancement' 
  | 'image_generation' 
  | 'final_render'
  | 'creative_brief';

export interface GenerationResult<T = string> {
  data: T;
  provider: ProviderName;
  model: string;
  durationMs: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface TextGenerationOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface ImagePromptOptions {
  prompt: string;
  aspectRatio: '16:9' | '4:5' | '1:1' | '9:16';
  style?: string;
}

export interface ImageGenerationResult {
  imageUrl?: string;
  imageBuffer?: Buffer;
  mimeType: string;
  provider: ProviderName;
  model: string;
  durationMs: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface AIProviderConfig {
  openaiApiKey?: string;
  geminiApiKey?: string;
  primaryProvider: 'openai' | 'gemini';
  fallbackProvider: 'openai' | 'gemini' | 'none';
  openaiModel?: string;
  geminiModel?: string;
}

export interface TestResult {
  provider: ProviderName;
  success: boolean;
  message: string;
  availableModels?: string[];
  errorCode?: string;
}
