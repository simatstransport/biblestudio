import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { VerseService } from '../services/verseService.js';

export const versesRouter = Router();

// GET /api/verses
versesRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = req.query.topic as string | undefined;
    const verses = await VerseService.getVersesByTopic(topic);
    return res.json({ success: true, count: verses.length, data: verses });
  } catch (err) {
    next(err);
  }
});

// GET /api/verses/random
versesRouter.get('/random', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const topic = req.query.topic as string | undefined;
    const exclude = (req.query.exclude as string || '').split(',').filter(Boolean);
    const verse = await VerseService.getRandomVerse(topic, exclude);
    return res.json({ success: true, data: verse });
  } catch (err) {
    next(err);
  }
});

// GET /api/verses/search
versesRouter.get('/search', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ref = req.query.ref as string;
    if (!ref) {
      return res.status(400).json({ error: 'Reference query parameter is required' });
    }
    const found = await VerseService.findByReference(ref);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Verse reference "${ref}" not found in verified canonical database.`
      });
    }
    return res.json({ success: true, data: found });
  } catch (err) {
    next(err);
  }
});
