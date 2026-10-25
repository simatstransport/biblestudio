import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { 
  thumbnailBriefSchema, 
  verseCaptionSchema, 
  imageGenerationSchema, 
  renderFinalSchema 
} from '../validators/schemas.js';
import { createRouterForUser } from '../services/routerFactory.js';
import { ImageCompositionService } from '../services/imageCompositionService.js';
import { getSupabaseAdmin } from '../services/supabaseService.js';
import { config } from '../config/index.js';

export const generateRouter = Router();

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPEG, WebP, SVG) are allowed.'));
    }
  }
});

// POST /api/generate/thumbnail-brief
generateRouter.post('/thumbnail-brief', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const input = thumbnailBriefSchema.parse(req.body);
    const router = await createRouterForUser(userId);

    const systemPrompt = `You are a world-class YouTube Creative Director and Thumbnail Optimization Specialist.
Your goal is to optimize YouTube thumbnails for high Click-Through-Rate (CTR), striking clarity, and emotional resonance.
Keep titles under 6 words so they remain readable on mobile screens.
Respond with pure JSON only matching this format:
{
  "titleSuggestions": ["Hook 1", "Hook 2", "Hook 3"],
  "subtitleHook": "Short compelling punchline",
  "backgroundPrompt": "Detailed visual background description without text",
  "colorPalette": {
    "primary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "visualAdvice": "Advice for subject positioning and contrast"
}`;

    const userPrompt = `Generate optimized thumbnail design recommendations for:
- Video Title: "${input.mainTitle}"
- Subtitle: "${input.subtitle || 'None'}"
- Call to Action: "${input.callToAction || 'None'}"
- Theme: ${input.theme}
- Language: ${input.language}
- Target Audience: ${input.targetAudience || 'General'}
- Additional Instructions: ${input.additionalInstructions || 'None'}

Remember: If language is 'tamil' or 'bilingual', include suitable Tamil script text options where appropriate!`;

    const result = await router.generateText({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      temperature: 0.7
    }, 'title_suggestions');

    let parsed = {};
    try {
      parsed = JSON.parse(result.data);
    } catch {
      parsed = { titleSuggestions: [input.mainTitle], subtitleHook: input.subtitle };
    }

    return res.json({
      success: true,
      data: parsed,
      meta: {
        provider: result.provider,
        model: result.model,
        durationMs: result.durationMs,
        fallbackUsed: result.fallbackUsed,
        fallbackReason: result.fallbackReason
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/verse-caption
generateRouter.post('/verse-caption', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const input = verseCaptionSchema.parse(req.body);
    const router = await createRouterForUser(userId);

    const systemPrompt = `You are a respectful Christian pastor and devotional writer.
Write an uplifting, thoughtful devotional caption and 5-8 relevant Christian hashtags based on the scripture provided.
Respond in pure JSON matching:
{
  "caption": "Inspirational 2-3 sentence devotional reflection",
  "prayer": "Short 1 sentence prayer",
  "hashtags": ["#Faith", "#BibleVerse", "#Scripture"]
}`;

    const userPrompt = `Scripture: ${input.verseReference}
Verse Text: "${input.verseText}"
Language Mode: ${input.language}
Topic: ${input.topic}

Provide the devotional caption matching the language mode (${input.language === 'tamil' ? 'in Tamil' : input.language === 'bilingual' ? 'in both English and Tamil' : 'in English'}).`;

    const result = await router.generateText({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      temperature: 0.7
    }, 'caption_generation');

    let parsed = {};
    try {
      parsed = JSON.parse(result.data);
    } catch {
      parsed = { caption: 'May this Word bless your heart and strengthen your faith today.', hashtags: ['#Faith', '#BibleVerse'] };
    }

    return res.json({
      success: true,
      data: parsed,
      meta: {
        provider: result.provider,
        model: result.model,
        durationMs: result.durationMs,
        fallbackUsed: result.fallbackUsed
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/image
generateRouter.post('/image', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const input = imageGenerationSchema.parse(req.body);
    const router = await createRouterForUser(userId);

    try {
      const result = await router.generateImage({
        prompt: input.prompt,
        aspectRatio: input.aspectRatio,
        style: input.style
      });

      return res.json({
        success: true,
        imageUrl: result.imageUrl,
        provider: result.provider,
        model: result.model,
        durationMs: result.durationMs,
        fallbackUsed: result.fallbackUsed
      });
    } catch (aiErr: any) {
      console.warn('AI image generation unavailable, returning recommended preset background:', aiErr.message);
      // Fallback gracefully to high-res spiritual preset background
      const fallbackPreset = input.type === 'spiritual_background' ? 'heavenly_gold' : 'cinematic_bold';
      return res.json({
        success: true,
        presetFallback: true,
        preset: fallbackPreset,
        message: 'AI Image generation fallback: Using curated studio background preset.'
      });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/upload-asset
generateRouter.post('/upload-asset', requireAuth, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const userId = req.user!.id;
    const file = req.file;
    const assetType = req.body.assetType || 'logo';

    // Store in Supabase Storage if configured
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from(config.supabase.assetsBucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(config.supabase.assetsBucket)
          .getPublicUrl(fileName);

        return res.json({
          success: true,
          url: publicUrlData.publicUrl,
          mimeType: file.mimetype,
          size: file.size
        });
      }
    }

    // Local / Dev Fallback: Return Base64 data URL
    const base64Url = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return res.json({
      success: true,
      url: base64Url,
      mimeType: file.mimetype,
      size: file.size
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/render-final
generateRouter.post('/render-final', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = renderFinalSchema.parse(req.body);

    const imageBuffer = await ImageCompositionService.composeImage({
      type: input.type,
      aspectRatio: input.aspectRatio,
      background: input.background,
      texts: input.texts,
      images: input.images as any,
      contactInfo: input.contactInfo,
      eventInfo: input.eventInfo
    });

    // Check if client wants raw image download or JSON data URL
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('image/png') || req.query.format === 'binary') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(input.title)}.png"`);
      return res.send(imageBuffer);
    }

    const dataUrl = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    return res.json({
      success: true,
      dataUrl,
      dimensions: ImageCompositionService.getDimensions(input.aspectRatio),
      sizeBytes: imageBuffer.length
    });
  } catch (err) {
    next(err);
  }
});
