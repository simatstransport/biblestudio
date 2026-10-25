import dotenv from 'dotenv';
import path from 'path';

// Load .env from root workspace or local server directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const encryptionKey = process.env.ENCRYPTION_KEY || '8f4b23c7a91e5d0824b619e48c73105dfa02b489c7216a3e5c91b7d840ef1a2c';

if (!encryptionKey || (encryptionKey.length !== 64 && Buffer.from(encryptionKey).length !== 32)) {
  console.warn('⚠️ WARNING: ENCRYPTION_KEY should be 32 bytes (64 hex characters) for AES-256-GCM. Using default development key.');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  encryptionKey: encryptionKey,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    assetsBucket: process.env.SUPABASE_STORAGE_ASSETS_BUCKET || 'studio-assets',
    generatedBucket: process.env.SUPABASE_STORAGE_GENERATED_BUCKET || 'generated-images',
  },
  defaults: {
    openaiApiKey: process.env.DEFAULT_OPENAI_API_KEY || '',
    geminiApiKey: process.env.DEFAULT_GEMINI_API_KEY || '',
  },
  instagram: {
    userId: process.env.INSTAGRAM_USER_ID || '17841469954164282',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  }
};
