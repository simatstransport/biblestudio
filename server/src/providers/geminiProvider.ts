import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextGenerationOptions, ImagePromptOptions, TestResult, ProviderName } from './types.js';

export class GeminiProvider {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;
  public defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gemini-flash-latest') {
    if (!apiKey) {
      throw new Error('Gemini API key is required.');
    }
    this.apiKey = apiKey;
    this.defaultModel = this.resolveModelName(defaultModel);
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  private resolveModelName(model?: string): string {
    if (!model) return 'gemini-flash-latest';
    // Automatically map deprecated or unavailable models to active Gemini models
    if (/gemini-1\.5|gemini-2\.0|gemini-2\.5-flash$/i.test(model)) {
      return 'gemini-flash-latest';
    }
    return model;
  }

  async testConnection(): Promise<TestResult> {
    try {
      const targetModel = this.resolveModelName(this.defaultModel);
      const model = this.genAI.getGenerativeModel({ model: targetModel });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Respond with "OK" if connected.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });

      const text = result.response.text();
      return {
        provider: 'gemini',
        success: true,
        message: 'Google Gemini connection verified successfully.',
        availableModels: ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.5-flash-lite']
      };
    } catch (err: any) {
      const isAuth = GeminiProvider.isAuthError(err);
      const isQuota = GeminiProvider.isQuotaError(err);

      let message = err.message || 'Failed to connect to Google Gemini';
      if (isAuth) message = 'Invalid Gemini API key. Please check your key at aistudio.google.com';
      if (isQuota) message = 'Gemini quota exceeded or rate limit reached. Please check your Google AI Studio plan.';

      return {
        provider: 'gemini',
        success: false,
        message,
        errorCode: err.status || 'ERROR'
      };
    }
  }

  private async executeGenerateText(modelName: string, options: TextGenerationOptions): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemPrompt
    });

    const generationConfig: any = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 1000,
    };

    if (options.responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: options.userPrompt }] }],
      generationConfig
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return text;
  }

  async generateText(options: TextGenerationOptions, modelOverride?: string): Promise<string> {
    const primaryTarget = this.resolveModelName(modelOverride || this.defaultModel);
    try {
      return await this.executeGenerateText(primaryTarget, options);
    } catch (err: any) {
      // Auto-fallback if specific model is deprecated or unavailable
      if ((err.status === 404 || /not found|no longer available/i.test(err.message)) && primaryTarget !== 'gemini-flash-latest') {
        console.warn(`Gemini model ${primaryTarget} unavailable, falling back to gemini-flash-latest`);
        return await this.executeGenerateText('gemini-flash-latest', options);
      }
      throw err;
    }
  }

  async generateImage(options: ImagePromptOptions): Promise<{ url: string }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`;
    
    let ar = '1:1';
    if (options.aspectRatio === '16:9') ar = '16:9';
    else if (options.aspectRatio === '4:5') ar = '3:4';
    else if (options.aspectRatio === '9:16') ar = '9:16';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: options.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: ar,
          outputMimeType: 'image/jpeg'
        }
      })
    });

    const data = await response.json() as any;

    if (!response.ok || !data.predictions?.[0]?.bytesBase64Encoded) {
      const errMsg = data.error?.message || 'Google Imagen 3 API failed to generate image.';
      throw new Error(errMsg);
    }

    const base64 = data.predictions[0].bytesBase64Encoded;
    return {
      url: `data:image/jpeg;base64,${base64}`
    };
  }

  static isQuotaError(err: any): boolean {
    return (
      err.status === 429 ||
      (typeof err.message === 'string' && /RESOURCE_EXHAUSTED|quota|rate limit|too many requests/i.test(err.message))
    );
  }

  static isAuthError(err: any): boolean {
    return (
      err.status === 400 && (typeof err.message === 'string' && /API_KEY_INVALID|key not valid/i.test(err.message)) ||
      err.status === 403 ||
      (typeof err.message === 'string' && /API key not valid|invalid api key/i.test(err.message))
    );
  }

  static isSafetyRefusal(err: any): boolean {
    return (
      (typeof err.message === 'string' && /SAFETY|blocked due to safety/i.test(err.message))
    );
  }

  static isRetryable(err: any): boolean {
    const status = err.status || err.statusCode;
    return status === 500 || status === 503 || (typeof err.message === 'string' && /UNAVAILABLE|overloaded/i.test(err.message));
  }
}
