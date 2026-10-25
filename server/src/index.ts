import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { aiSettingsRouter } from './routes/aiSettings.js';
import { generateRouter } from './routes/generate.js';
import { versesRouter } from './routes/verses.js';
import { projectsRouter } from './routes/projects.js';
import { historyRouter } from './routes/history.js';
import { instagramRouter } from './routes/instagram.js';

const app = express();

// Security and CORS configuration
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parser with 25MB limit to comfortably accommodate high-resolution image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Faith & Creator Studio API',
    version: '1.0.0',
    supabaseConnected: Boolean(config.supabase.url && config.supabase.serviceRoleKey)
  });
});

// Mount API routes
app.use('/api/ai-settings', aiSettingsRouter);
app.use('/api/generate', generateRouter);
app.use('/api/ai', generateRouter);
app.use('/api/verses', versesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/history', historyRouter);
app.use('/api/instagram', instagramRouter);

// Global Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`✨ Faith & Creator Studio API listening on http://localhost:${config.port}`);
    console.log(`🔒 Encryption service initialized for API key protection.`);
  });
}

export default app;
