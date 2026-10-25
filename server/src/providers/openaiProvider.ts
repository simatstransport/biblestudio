import OpenAI from 'openai';
import { TextGenerationOptions, ImagePromptOptions, TestResult, ProviderName } from './types.js';

export class OpenAIProvider {
  private client: OpenAI;
  private apiKey: string;
  public defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gpt-4o') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required.');
    }
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.client = new OpenAI({ apiKey: this.apiKey, timeout: 45000 });
  }

  async testConnection(): Promise<TestResult> {
    try {
      const response = await this.client.models.list();
      const modelIds = response.data
        .map(m => m.id)
        .filter(id => id.includes('gpt') || id.includes('dall-e'));

      return {
        provider: 'openai',
        success: true,
        message: 'OpenAI connection verified successfully.',
        availableModels: modelIds.slice(0, 10)
      };
    } catch (err: any) {
      const isAuth = err.status === 401 || err.code === 'invalid_api_key';
      const isQuota = err.status === 429 || err.code === 'insufficient_quota';

      let message = err.message || 'Failed to connect to OpenAI';
      if (isAuth) message = 'Invalid OpenAI API key. Please check your key at platform.openai.com/api-keys';
      if (isQuota) message = 'OpenAI quota exceeded or rate limit reached. Please check your OpenAI billing plan.';

      return {
        provider: 'openai',
        success: false,
        message,
        errorCode: err.code || String(err.status || 'UNKNOWN')
      };
    }
  }

  async generateText(options: TextGenerationOptions, modelOverride?: string): Promise<string> {
    const model = modelOverride || this.defaultModel;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.userPrompt });

    const completion = await this.client.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
      response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response.');
    }
    return content;
  }

  async generateImage(options: ImagePromptOptions): Promise<{ url: string; revisedPrompt?: string }> {
    // DALL-E 3 supports 1024x1024, 1024x1792 (portrait), 1792x1024 (landscape)
    let size: '1024x1024' | '1792x1024' | '1024x1792' = '1792x1024';
    if (options.aspectRatio === '16:9') size = '1792x1024';
    else if (options.aspectRatio === '4:5' || options.aspectRatio === '9:16') size = '1024x1792';
    else if (options.aspectRatio === '1:1') size = '1024x1024';

    const response = await this.client.images.generate({
      model: 'dall-e-3',
      prompt: options.prompt,
      n: 1,
      size,
      quality: 'standard',
      response_format: 'url'
    });

    const imageUrl = response.data?.[0]?.url;
    if (!imageUrl) {
      throw new Error('OpenAI DALL-E failed to return an image URL.');
    }

    return {
      url: imageUrl,
      revisedPrompt: response.data?.[0]?.revised_prompt
    };
  }

  static isQuotaError(err: any): boolean {
    return (
      err.status === 429 ||
      err.code === 'insufficient_quota' ||
      err.code === 'rate_limit_exceeded' ||
      (typeof err.message === 'string' && /quota|rate limit|too many requests/i.test(err.message))
    );
  }

  static isAuthError(err: any): boolean {
    return (
      err.status === 401 ||
      err.code === 'invalid_api_key' ||
      (typeof err.message === 'string' && /invalid api key|incorrect api key/i.test(err.message))
    );
  }

  static isSafetyRefusal(err: any): boolean {
    return (
      err.code === 'content_policy_violation' ||
      (typeof err.message === 'string' && /content policy|safety system|safety guidelines/i.test(err.message))
    );
  }

  static isRetryable(err: any): boolean {
    const status = err.status || err.statusCode;
    return status === 500 || status === 502 || status === 503 || status === 504 || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET';
  }
}
