import { OpenAIProvider } from './openaiProvider.js';
import { GeminiProvider } from './geminiProvider.js';
import { 
  AIProviderConfig, 
  GenerationResult, 
  ImageGenerationResult, 
  ImagePromptOptions, 
  ProviderName, 
  TaskType, 
  TextGenerationOptions 
} from './types.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';

export class AIRouter {
  private openai?: OpenAIProvider;
  private gemini?: GeminiProvider;
  private primaryProvider: ProviderName;
  private fallbackProvider: 'openai' | 'gemini' | 'none';
  private userId?: string;

  constructor(config: AIProviderConfig, userId?: string) {
    this.primaryProvider = config.primaryProvider || 'openai';
    this.fallbackProvider = config.fallbackProvider || 'gemini';
    this.userId = userId;

    if (config.openaiApiKey) {
      this.openai = new OpenAIProvider(config.openaiApiKey, config.openaiModel || 'gpt-4o');
    }
    if (config.geminiApiKey) {
      this.gemini = new GeminiProvider(config.geminiApiKey, config.geminiModel || 'gemini-1.5-flash');
    }
  }

  private getProviderInstance(name: ProviderName) {
    if (name === 'openai') return this.openai;
    if (name === 'gemini') return this.gemini;
    return undefined;
  }

  private async recordHistory(
    provider: ProviderName,
    model: string,
    taskType: TaskType,
    fallbackUsed: boolean,
    status: 'success' | 'failed' | 'fallback_recovered',
    durationMs: number,
    errorCategory?: string
  ) {
    if (!this.userId) return;

    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from('generation_history').insert({
          user_id: this.userId,
          provider,
          model,
          task_type: taskType,
          fallback_used: fallbackUsed,
          status,
          duration_ms: durationMs,
          error_category: errorCategory
        });
      }
    } catch (err: any) {
      console.warn('Could not record generation history:', err.message);
    }
  }

  /**
   * Executes a text generation task with bounded retry and intelligent fallback.
   */
  async generateText(options: TextGenerationOptions, taskType: TaskType = 'title_suggestions'): Promise<GenerationResult<string>> {
    const primaryName = this.primaryProvider;
    const primary = this.getProviderInstance(primaryName);

    const fallbackName = this.fallbackProvider !== 'none' && this.fallbackProvider !== primaryName ? this.fallbackProvider : null;
    const fallback = fallbackName ? this.getProviderInstance(fallbackName) : null;

    if (!primary && !fallback) {
      throw new Error('No AI provider configured. Please set up your OpenAI or Google Gemini API key in Settings.');
    }

    const startTime = Date.now();

    // 1. Try Primary Provider if configured
    if (primary) {
      try {
        const text = await primary.generateText(options);
        const durationMs = Date.now() - startTime;
        
        await this.recordHistory(primaryName, primary.defaultModel, taskType, false, 'success', durationMs);

        return {
          data: text,
          provider: primaryName,
          model: primary.defaultModel,
          durationMs,
          fallbackUsed: false
        };
      } catch (err: any) {
        const durationMs = Date.now() - startTime;

        // Never bypass safety refusals
        const isSafety = (primaryName === 'openai' && OpenAIProvider.isSafetyRefusal(err)) ||
                         (primaryName === 'gemini' && GeminiProvider.isSafetyRefusal(err));
        if (isSafety) {
          await this.recordHistory(primaryName, primary.defaultModel, taskType, false, 'failed', durationMs, 'safety_refusal');
          throw new Error(`Content generation refused by ${primaryName.toUpperCase()} safety policy: ${err.message}`);
        }

        // Never retry or switch on invalid key
        const isAuth = (primaryName === 'openai' && OpenAIProvider.isAuthError(err)) ||
                       (primaryName === 'gemini' && GeminiProvider.isAuthError(err));
        if (isAuth) {
          await this.recordHistory(primaryName, primary.defaultModel, taskType, false, 'failed', durationMs, 'invalid_key');
          throw new Error(`Authentication failed for ${primaryName.toUpperCase()}. Please check your API key in Settings.`);
        }

        const isQuota = (primaryName === 'openai' && OpenAIProvider.isQuotaError(err)) ||
                        (primaryName === 'gemini' && GeminiProvider.isQuotaError(err));
        const isRetryable = (primaryName === 'openai' && OpenAIProvider.isRetryable(err)) ||
                            (primaryName === 'gemini' && GeminiProvider.isRetryable(err));

        console.warn(`Primary AI provider (${primaryName}) encountered an issue:`, err.message);

        // If fallback provider is not available, report error
        if (!fallback || !fallbackName) {
          await this.recordHistory(primaryName, primary.defaultModel, taskType, false, 'failed', durationMs, isQuota ? 'quota_exceeded' : 'provider_error');
          throw new Error(`${primaryName.toUpperCase()} failed: ${err.message}. No fallback provider is configured.`);
        }

        // 2. Perform Fallback
        const fallbackStartTime = Date.now();
        const fallbackReason = isQuota ? 'primary_quota_exceeded' : isRetryable ? 'primary_transient_error' : 'primary_failed';

        try {
          const text = await fallback.generateText(options);
          const totalDuration = Date.now() - startTime;

          await this.recordHistory(fallbackName, fallback.defaultModel, taskType, true, 'fallback_recovered', totalDuration, fallbackReason);

          return {
            data: text,
            provider: fallbackName,
            model: fallback.defaultModel,
            durationMs: totalDuration,
            fallbackUsed: true,
            fallbackReason
          };
        } catch (fallbackErr: any) {
          const totalDuration = Date.now() - startTime;
          await this.recordHistory(fallbackName, fallback.defaultModel, taskType, true, 'failed', totalDuration, 'fallback_failed');
          throw new Error(`Both AI providers failed. Primary (${primaryName}): ${err.message}. Fallback (${fallbackName}): ${fallbackErr.message}`);
        }
      }
    }

    // If primary wasn't configured, but fallback is
    if (fallback && fallbackName) {
      const text = await fallback.generateText(options);
      const durationMs = Date.now() - startTime;
      await this.recordHistory(fallbackName, fallback.defaultModel, taskType, true, 'success', durationMs, 'primary_unconfigured');
      return {
        data: text,
        provider: fallbackName,
        model: fallback.defaultModel,
        durationMs,
        fallbackUsed: true,
        fallbackReason: 'primary_unconfigured'
      };
    }

    throw new Error('Unable to route AI request.');
  }

  /**
   * Generates images using OpenAI DALL-E or suitable image pipeline.
   */
  async generateImage(options: ImagePromptOptions): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    // Try OpenAI DALL-E 3 first if configured
    if (this.openai) {
      try {
        const result = await this.openai.generateImage(options);
        const durationMs = Date.now() - startTime;

        await this.recordHistory('openai', 'dall-e-3', 'image_generation', false, 'success', durationMs);

        return {
          imageUrl: result.url,
          mimeType: 'image/png',
          provider: 'openai',
          model: 'dall-e-3',
          durationMs,
          fallbackUsed: false
        };
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        console.warn('OpenAI image generation failed:', err.message);

        const isQuota = OpenAIProvider.isQuotaError(err);
        const isAuth = OpenAIProvider.isAuthError(err);
        if (isAuth) {
          throw new Error('OpenAI API key is invalid for image generation.');
        }

        // Return clear indication of failure so the studio composition fallback can kick in
        throw new Error(`Image generation error: ${err.message}`);
      }
    }

    // If Gemini is configured without OpenAI
    if (this.gemini) {
      try {
        const gemResult = await this.gemini.generateImage(options);
        const durationMs = Date.now() - startTime;
        await this.recordHistory('gemini', 'imagen-3.0-generate-002', 'image_generation', false, 'success', durationMs);
        return {
          imageUrl: gemResult.url,
          mimeType: 'image/jpeg',
          provider: 'gemini',
          model: 'imagen-3.0-generate-002',
          durationMs,
          fallbackUsed: false
        };
      } catch (gemErr: any) {
        throw new Error(`Google Imagen generation failed: ${gemErr.message}`);
      }
    }

    throw new Error('No image-capable AI provider configured. Please provide an OpenAI or Google Gemini API key in Settings.');
  }
}
