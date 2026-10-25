import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { InstagramService } from '../services/instagramService.js';

export const instagramRouter = Router();

// POST /api/instagram/publish-custom
instagramRouter.post('/publish-custom', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl, caption, igUserId, accessToken } = req.body;

    if (!imageUrl || !caption || !igUserId || !accessToken) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'imageUrl, caption, igUserId, and accessToken are all required.'
      });
    }

    const result = await InstagramService.publishPhoto({
      imageUrl,
      caption,
      igUserId,
      accessToken
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/instagram/trigger-daily (Can be triggered manually or via cron/webhook)
instagramRouter.post('/trigger-daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const igUserId = req.body.igUserId || process.env.INSTAGRAM_USER_ID;
    const accessToken = req.body.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN;
    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;

    // Optional verification if using Vercel Cron or GitHub Actions
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
