import test from 'node:test';
import assert from 'node:assert';
import { encryptSecret, decryptSecret, maskApiKey } from '../src/security/encryption.js';

test('AES-256-GCM Encryption and Decryption', async (t) => {
  await t.test('should encrypt and decrypt an API key accurately', () => {
    const rawKey = 'sample-test-api-key-1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = encryptSecret(rawKey);

    assert.notStrictEqual(encrypted, rawKey);
    assert.match(encrypted, /^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+$/);

    const decrypted = decryptSecret(encrypted);
    assert.strictEqual(decrypted, rawKey);
  });

  await t.test('should fail safely on tampered ciphertext', () => {
    const rawKey = 'test-key-sample';
    const encrypted = encryptSecret(rawKey);
    const parts = encrypted.split('.');
    
    // Tamper with ciphertext
    const tampered = `${parts[0]}.${parts[1]}.badcipher`;
    assert.throws(() => {
      decryptSecret(tampered);
    });
  });

  await t.test('should mask API keys without leaking secrets', () => {
    const sampleKey = 'sk-proj-samplemockkey1234567890abcdefghijklmnopqrstuvwxyzKr4A';
    const masked = maskApiKey(sampleKey);

    assert.ok(masked.startsWith('sk-proj'));
    assert.ok(masked.includes('••••••••'));
    assert.ok(masked.endsWith('Kr4A'));
  });
});
