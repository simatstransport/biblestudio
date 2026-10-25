import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { InstagramService } from '../services/instagramService.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';
import { config } from '../config/index.js';
import { getUserSettings } from './aiSettings.js';
import { decryptSecret } from '../security/encryption.js';

export const instagramRouter = Router();

// POST /api/instagram/publish-custom (Manual Instagram Publish Trigger)
instagramRouter.post('/publish-custom', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { imageUrl, caption, igUserId, accessToken } = req.body;

    igUserId = igUserId || process.env.INSTAGRAM_USER_ID || config.instagram?.userId;
    accessToken = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || config.instagram?.accessToken;

    if (!accessToken && req.user?.id) {
      try {
        const userSettings = await getUserSettings(req.user.id);
        if (userSettings?.encrypted_instagram_token) {
          accessToken = decryptSecret(userSettings.encrypted_instagram_token);
        }
        if (userSettings?.instagram_user_id) {
          igUserId = userSettings.instagram_user_id;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!igUserId || !accessToken) {
      return res.status(400).json({
        error: 'Instagram account not configured',
        message: 'INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN must be added in Vercel Environment Variables (or server .env) to enable publishing to @creationbibleverse.'
      });
    }

    let publicUrl = imageUrl;

    // If image is a base64 Data URL, upload to Supabase Storage to get public HTTPS URL for Meta Graph API
    if (imageUrl.startsWith('data:image')) {
      const base64Data = imageUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const supabase = getSupabaseAdmin();

      if (supabase) {
        const fileName = `manual-posts/${Date.now()}-poster.png`;
        const { error: uploadError } = await supabase.storage
          .from(config.supabase.generatedBucket)
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from(config.supabase.generatedBucket)
            .getPublicUrl(fileName);
          publicUrl = publicData.publicUrl;
        }
      }
    }

    const result = await InstagramService.publishPhoto({
      imageUrl: publicUrl,
      caption: caption || 'Daily Scripture Poster #BibleVerse #Faith',
      igUserId,
      accessToken
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Published successfully to Instagram!',
      mediaId: result.mediaId
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/instagram/trigger-daily (Scheduled or Manual Daily Post Trigger)
instagramRouter.post('/trigger-daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const igUserId = req.body.igUserId || process.env.INSTAGRAM_USER_ID || config.instagram?.userId;
    const accessToken = req.body.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || config.instagram?.accessToken;
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;

    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized cron trigger' });
    }

    if (!igUserId || !accessToken) {
      return res.status(400).json({
        error: 'Missing Instagram configuration',
        message: 'INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN are required in environment or request body.'
      });
    }

    const result = await InstagramService.executeDailyPost(igUserId, accessToken, req.body.languageMode || 'bilingual');

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Daily Scripture poster published successfully to Instagram!',
      mediaId: result.mediaId
    });
  } catch (err) {
    next(err);
  }
});
