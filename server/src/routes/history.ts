import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';

export const historyRouter = Router();

// GET /api/history
historyRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }

    return res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
});
