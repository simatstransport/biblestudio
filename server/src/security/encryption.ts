import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derives a valid 32-byte Buffer from the configured encryption key string.
 */
function getKeyBuffer(): Buffer {
  const rawKey = config.encryptionKey;
  if (!rawKey) {
    throw new Error('Encryption configuration is missing. Cannot perform cryptographic operations.');
  }

  // If it's a 64-character hex string, parse it
  if (rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // Otherwise SHA-256 hash it to guarantee exactly 32 bytes
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts a plaintext secret (such as an API key) using AES-256-GCM.
 * Output format: `iv.authTag.ciphertext` in base64url.
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Plaintext string is required for encryption.');
  }

  const key = getKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

/**
 * Decrypts a secret encrypted with AES-256-GCM.
 * Input format: `iv.authTag.ciphertext` in base64url.
 */
export function decryptSecret(encryptedPayload: string): string {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') {
    throw new Error('Encrypted payload is required for decryption.');
  }

  const parts = encryptedPayload.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format.');
  }

  const [ivB64, authTagB64, cipherB64] = parts;
  const key = getKeyBuffer();
  const iv = Buffer.from(ivB64, 'base64url');
  const authTag = Buffer.from(authTagB64, 'base64url');
  const encrypted = Buffer.from(cipherB64, 'base64url');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

/**
 * Creates a safe, masked representation of an API key for UI display.
 * Example: `sk-proj-ln...Kr4A` or `AQ.Ab8...3g`
 */
export function maskApiKey(key: string | null | undefined): string {
  if (!key || typeof key !== 'string') {
    return '';
  }

  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }

  const prefixLen = Math.min(7, Math.floor(trimmed.length / 4));
  const suffixLen = Math.min(4, Math.floor(trimmed.length / 5));

  const prefix = trimmed.substring(0, prefixLen);
  const suffix = trimmed.substring(trimmed.length - suffixLen);

  return `${prefix}••••••••${suffix}`;
}
