import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { InstagramService } from '../services/instagramService.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';
import { config } from '../config/index.js';

export const instagramRouter = Router();

// POST /api/instagram/publish-custom (Manual Instagram Publish Trigger)
instagramRouter.post('/publish-custom', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { imageUrl, caption, igUserId, accessToken } = req.body;

    igUserId = igUserId || process.env.INSTAGRAM_USER_ID;
    accessToken = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!igUserId || !accessToken) {
      return res.status(400).json({
        error: 'Instagram account not configured',
        message: 'INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN must be configured in environment or provided in request.'
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
    const igUserId = req.body.igUserId || process.env.INSTAGRAM_USER_ID;
    const accessToken = req.body.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
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
