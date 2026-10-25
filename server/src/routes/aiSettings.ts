import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiSettingsSchema, testProviderSchema } from '../validators/schemas.js';
import { encryptSecret, decryptSecret, maskApiKey } from '../security/encryption.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';
import { OpenAIProvider } from '../providers/openaiProvider.js';
import { GeminiProvider } from '../providers/geminiProvider.js';
import { config } from '../config/index.js';

export const aiSettingsRouter = Router();

// In-memory store for local sandbox when Supabase is not connected
const localSettingsStore = new Map<string, any>();

/**
 * Helper to fetch settings for a user
 */
export async function getUserSettings(userId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase
      .from('user_ai_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) return data;
  }
  return localSettingsStore.get(userId) || null;
}

// GET /api/ai-settings
aiSettingsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const settings = await getUserSettings(userId);

    let openaiMasked = '';
    let geminiMasked = '';
    let hasOpenai = false;
    let hasGemini = false;

    // Check saved user settings
    if (settings?.encrypted_openai_key) {
      try {
        const decrypted = decryptSecret(settings.encrypted_openai_key);
        openaiMasked = maskApiKey(decrypted);
        hasOpenai = true;
      } catch (err) {
        console.warn('Could not decrypt saved OpenAI key');
      }
    }

    if (settings?.encrypted_gemini_key) {
      try {
        const decrypted = decryptSecret(settings.encrypted_gemini_key);
        geminiMasked = maskApiKey(decrypted);
        hasGemini = true;
      } catch (err) {
        console.warn('Could not decrypt saved Gemini key');
      }
    }

    // If user hasn't set keys yet, check if system/admin defaults exist
    if (!hasOpenai && config.defaults.openaiApiKey) {
      openaiMasked = maskApiKey(config.defaults.openaiApiKey);
      hasOpenai = true;
    }
    if (!hasGemini && config.defaults.geminiApiKey) {
      geminiMasked = maskApiKey(config.defaults.geminiApiKey);
      hasGemini = true;
    }

    return res.json({
      configured: hasOpenai || hasGemini,
      openai: {
        configured: hasOpenai,
        maskedKey: openaiMasked,
        model: settings?.openai_model || 'gpt-4o',
        status: settings?.openai_status || (hasOpenai ? 'connected' : 'unconfigured')
      },
      gemini: {
        configured: hasGemini,
        maskedKey: geminiMasked,
        model: settings?.gemini_model || 'gemini-flash-latest',
        status: settings?.gemini_status || (hasGemini ? 'connected' : 'unconfigured')
      },
      primaryProvider: settings?.primary_provider || 'openai',
      fallbackProvider: settings?.fallback_provider || 'gemini'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai-settings
aiSettingsRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const validated = aiSettingsSchema.parse(req.body);

    const existing = await getUserSettings(userId);
    let encryptedOpenai = existing?.encrypted_openai_key;
    let encryptedGemini = existing?.encrypted_gemini_key;

    if (validated.openaiApiKey && validated.openaiApiKey.trim()) {
      encryptedOpenai = encryptSecret(validated.openaiApiKey.trim());
    }
    if (validated.geminiApiKey && validated.geminiApiKey.trim()) {
      encryptedGemini = encryptSecret(validated.geminiApiKey.trim());
    }

    const payload = {
      user_id: userId,
      encrypted_openai_key: encryptedOpenai || null,
      encrypted_gemini_key: encryptedGemini || null,
      primary_provider: validated.primaryProvider,
      fallback_provider: validated.fallbackProvider,
      openai_model: validated.openaiModel,
      gemini_model: validated.geminiModel,
      openai_status: encryptedOpenai ? 'connected' : 'unconfigured',
      gemini_status: encryptedGemini ? 'connected' : 'unconfigured',
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('user_ai_settings')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
    } else {
      localSettingsStore.set(userId, payload);
    }

    return res.json({
      success: true,
      message: 'AI provider settings updated successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai-settings/test
aiSettingsRouter.post('/test', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { provider, apiKey } = testProviderSchema.parse(req.body);

    let keyToTest = apiKey?.trim();

    // If key was not passed in form, retrieve decrypted saved key
    if (!keyToTest) {
      const settings = await getUserSettings(userId);
      if (provider === 'openai') {
        if (settings?.encrypted_openai_key) {
          keyToTest = decryptSecret(settings.encrypted_openai_key);
        } else if (config.defaults.openaiApiKey) {
          keyToTest = config.defaults.openaiApiKey;
        }
      } else if (provider === 'gemini') {
        if (settings?.encrypted_gemini_key) {
          keyToTest = decryptSecret(settings.encrypted_gemini_key);
        } else if (config.defaults.geminiApiKey) {
          keyToTest = config.defaults.geminiApiKey;
        }
      }
    }

    if (!keyToTest) {
      return res.status(400).json({
        success: false,
        message: `No ${provider.toUpperCase()} API key provided or found to test.`
      });
    }

    if (provider === 'openai') {
      const client = new OpenAIProvider(keyToTest);
      const testResult = await client.testConnection();
      return res.json(testResult);
    } else {
      const client = new GeminiProvider(keyToTest);
      const testResult = await client.testConnection();
      return res.json(testResult);
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ai-settings/:provider
aiSettingsRouter.delete('/:provider', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const provider = req.params.provider;

    if (provider !== 'openai' && provider !== 'gemini') {
      return res.status(400).json({ error: 'Invalid provider name' });
    }

    const supabase = getSupabaseAdmin();
    const updateField = provider === 'openai' 
      ? { encrypted_openai_key: null, openai_status: 'unconfigured' }
      : { encrypted_gemini_key: null, gemini_status: 'unconfigured' };

    if (supabase) {
      await supabase.from('user_ai_settings').update(updateField).eq('user_id', userId);
    } else {
      const existing = localSettingsStore.get(userId) || {};
      localSettingsStore.set(userId, { ...existing, ...updateField });
    }

    return res.json({ success: true, message: `${provider.toUpperCase()} configuration removed.` });
  } catch (err) {
    next(err);
  }
});
