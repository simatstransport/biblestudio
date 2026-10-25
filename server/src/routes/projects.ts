import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';

export const projectsRouter = Router();

// In-memory fallback projects store for local development
const localProjectsStore = new Map<string, any[]>();

// GET /api/projects
projectsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const type = req.query.type as string | undefined;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      let query = supabase
        .from('creative_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('project_type', type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json({ success: true, data: data || [] });
    }

    let userProjects = localProjectsStore.get(userId) || [];
    if (type) {
      userProjects = userProjects.filter(p => p.project_type === type);
    }
    return res.json({ success: true, data: userProjects });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
projectsRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, project_type, input_data, design_preferences, status } = req.body;

    const newProject = {
      user_id: userId,
      title: title || 'Untitled Project',
      project_type: project_type || 'youtube_thumbnail',
      input_data: input_data || {},
      design_preferences: design_preferences || {},
      status: status || 'draft',
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('creative_projects')
        .insert(newProject)
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    const projectId = 'proj-' + Date.now();
    const stored = { id: projectId, ...newProject };
    const list = localProjectsStore.get(userId) || [];
    list.unshift(stored);
    localProjectsStore.set(userId, list);

    return res.status(201).json({ success: true, data: stored });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('creative_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return res.json({ success: true, data });
    }

    const list = localProjectsStore.get(userId) || [];
    const found = list.find(p => p.id === projectId);
    if (!found) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ success: true, data: found });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
projectsRouter.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const { title, input_data, design_preferences, status, is_favorite } = req.body;

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (input_data !== undefined) updateData.input_data = input_data;
    if (design_preferences !== undefined) updateData.design_preferences = design_preferences;
    if (status !== undefined) updateData.status = status;
    if (is_favorite !== undefined) updateData.is_favorite = is_favorite;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('creative_projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return res.json({ success: true, data });
    }

    const list = localProjectsStore.get(userId) || [];
    const idx = list.findIndex(p => p.id === projectId);
    if (idx === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    list[idx] = { ...list[idx], ...updateData };
    return res.json({ success: true, data: list[idx] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase
        .from('creative_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);
      if (error) throw error;
      return res.json({ success: true, message: 'Project deleted' });
    }

    const list = localProjectsStore.get(userId) || [];
    localProjectsStore.set(userId, list.filter(p => p.id !== projectId));
    return res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
});
