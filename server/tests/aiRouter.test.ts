import test from 'node:test';
import assert from 'node:assert';
import { AIRouter } from '../src/providers/aiRouter.js';

test('AI Provider Routing & Fallback Mechanics', async (t) => {
  await t.test('should validate router throws descriptive error when no providers are configured', async () => {
    const router = new AIRouter({
      primaryProvider: 'openai',
      fallbackProvider: 'gemini'
    });

    await assert.rejects(
      async () => {
        await router.generateText({ userPrompt: 'Hello' });
      },
      /No AI provider configured/
    );
  });

  await t.test('should correctly prioritize configured fallback when primary is missing', async () => {
    // Fake gemini key for initialization
    const router = new AIRouter({
      geminiApiKey: 'fake-gemini-key',
      primaryProvider: 'openai',
      fallbackProvider: 'gemini'
    });

    // Mock internal gemini generateText
    (router as any).gemini = {
      defaultModel: 'gemini-1.5-flash',
      generateText: async () => 'Gemini fallback text'
    };

    const res = await router.generateText({ userPrompt: 'Test prompt' });
    assert.strictEqual(res.data, 'Gemini fallback text');
    assert.strictEqual(res.provider, 'gemini');
    assert.strictEqual(res.fallbackUsed, true);
    assert.strictEqual(res.fallbackReason, 'primary_unconfigured');
  });

  await t.test('should fallback to Gemini when OpenAI primary encounters a quota error', async () => {
    const router = new AIRouter({
      openaiApiKey: 'fake-openai-key',
      geminiApiKey: 'fake-gemini-key',
      primaryProvider: 'openai',
      fallbackProvider: 'gemini'
    });

    // Mock OpenAI throwing 429 quota
    (router as any).openai = {
      defaultModel: 'gpt-4o',
      generateText: async () => {
        const err: any = new Error('Rate limit reached');
        err.status = 429;
        err.code = 'insufficient_quota';
        throw err;
      }
    };

    // Mock Gemini succeeding
    (router as any).gemini = {
      defaultModel: 'gemini-1.5-flash',
      generateText: async () => 'Recovered content from Gemini'
    };

    const res = await router.generateText({ userPrompt: 'Test quota fallback' });
    assert.strictEqual(res.data, 'Recovered content from Gemini');
    assert.strictEqual(res.provider, 'gemini');
    assert.strictEqual(res.fallbackUsed, true);
    assert.strictEqual(res.fallbackReason, 'primary_quota_exceeded');
  });
});
