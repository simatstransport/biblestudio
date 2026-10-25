import { AIRouter } from '../providers/aiRouter.js';
import { getUserSettings } from '../routes/aiSettings.js';
import { decryptSecret } from '../security/encryption.js';
import { config } from '../config/index.js';

export async function createRouterForUser(userId: string): Promise<AIRouter> {
  const settings = await getUserSettings(userId);

  let openaiKey = '';
  let geminiKey = '';

  if (settings?.encrypted_openai_key) {
    try {
      openaiKey = decryptSecret(settings.encrypted_openai_key);
    } catch (e) {
      console.warn('Failed to decrypt user OpenAI key');
    }
  }
  if (!openaiKey && config.defaults.openaiApiKey) {
    openaiKey = config.defaults.openaiApiKey;
  }

  if (settings?.encrypted_gemini_key) {
    try {
      geminiKey = decryptSecret(settings.encrypted_gemini_key);
    } catch (e) {
      console.warn('Failed to decrypt user Gemini key');
    }
  }
  if (!geminiKey && config.defaults.geminiApiKey) {
    geminiKey = config.defaults.geminiApiKey;
  }

  return new AIRouter({
    openaiApiKey: openaiKey || undefined,
    geminiApiKey: geminiKey || undefined,
    primaryProvider: (settings?.primary_provider as any) || 'openai',
    fallbackProvider: (settings?.fallback_provider as any) || 'gemini',
    openaiModel: settings?.openai_model,
    geminiModel: settings?.gemini_model
  }, userId);
}
