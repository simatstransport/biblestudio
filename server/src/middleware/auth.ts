import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../services/supabaseService.js';
import { config } from '../config/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      accessToken?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];
    req.accessToken = token;

    // Check if Supabase admin is configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired session. Please sign in again.'
        });
      }

      req.user = {
        id: data.user.id,
        email: data.user.email || '',
        displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
        avatarUrl: data.user.user_metadata?.avatar_url
      };
      return next();
    }

    // Development / Local Sandbox Fallback (when Supabase URL is not yet configured by the user)
    if (config.nodeEnv === 'development' || !config.supabase.url) {
      // Decode mock or base64 token if provided
      if (token.startsWith('dev-user-') || token === 'demo-token') {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'creator@faithstudio.ai',
          displayName: 'Faith Creator',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop'
        };
        return next();
      }

      // Try basic token simulation for dev
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'developer@faithstudio.ai',
        displayName: 'Studio Developer'
      };
      return next();
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication service is not properly configured.'
    });
  } catch (err: any) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Failed to authenticate user.'
    });
  }
}
