import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { 
  thumbnailBriefSchema, 
  verseCaptionSchema, 
  imageGenerationSchema, 
  renderFinalSchema,
  posterAISchema,
  thumbnailAISchema,
  regenerateTextSchema 
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
    const isSolomonRequest = /solomon|temple sample|sample style/i.test(input.prompt);

    // Engineer prompt for photorealistic quality with zero text distortions
    let engineeredPrompt = input.prompt.trim();
    if (input.type === 'spiritual_background' || /bible|scripture|verse|god|lord|jesus|temple|heaven|holiness|divine|psalm|altar/i.test(input.prompt)) {
      engineeredPrompt = `Photorealistic 8K cinematic biblical scene: ${input.prompt}. Ancient Jerusalem temple atmosphere, majestic stone pillars, celestial heavenly god rays beam down from above, golden crown resting on deep royal blue velvet cloth, warm golden dust motes, dramatic chiaroscuro Rembrandt lighting, awe-inspiring sacred majesty. Pure cinematic background image, zero text, no letters, no words, no subtitles, no watermarks, 8K hyper-detailed wallpaper.`;
    } else {
      engineeredPrompt = `Ultra-dynamic 2026 YouTube thumbnail background: ${input.prompt}. High contrast, cinematic studio lighting, dramatic color palette, electric rim lighting, clean negative space on side for large text overlay, sharp depth of field, 8K resolution, zero text, no words, no letters, no typography, no watermarks.`;
    }
    const router = await createRouterForUser(userId);

    try {
      const result = await router.generateImage({
        prompt: engineeredPrompt,
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
      const fallbackPreset = isSolomonRequest || input.type === 'spiritual_background' ? 'solomon_temple' : 'cinematic_bold';
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


// POST /api/generate/poster-ai (Full AI Creative Pipeline for Bible Posters)
generateRouter.post('/poster-ai', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const input = posterAISchema.parse(req.body);
    const router = await createRouterForUser(userId);

    const startTime = Date.now();

    // 1. Creative Reasoning & Structured Design Brief via Gemini / OpenAI
    const systemPrompt = `You are an elite Christian Creative Director, Theological Scholar, and Art Director.
Analyze the user's Bible scripture, purpose, and atmosphere.
Synthesize a breathtaking, photorealistic visual concept that emotionally and spiritually embodies the scripture.
Determine the subject (e.g. Jesus Christ tenderly comforting, ancient temple with heavenly rays, peaceful still waters, Mount Sinai sunrise, prayerful believer).
CRITICAL: Design the composition with deliberate, high-contrast NEGATIVE SPACE (shadowed atmospheric area, dark vignette, or deep tones) where scripture typography can be rendered with crystal-clear readability.
Respond with pure JSON only matching this schema:
{
  "visualConcept": "Brief 1-2 sentence description of the visual scene",
  "subject": "Main subject description",
  "atmosphere": "Emotional atmosphere and mood",
  "lighting": "Cinematic lighting details (e.g. contre-jour golden rim lighting, 2800K warm tones, volumetric dust rays)",
  "composition": "Framing and focal point details, explicitly reserving one quadrant (e.g. right side, top, or bottom) in deep shadow for text",
  "textArea": "right_side",
  "colorPalette": {
    "primary": "#E6CA65",
    "secondary": "#FFFFFF",
    "accent": "#D4AF37",
    "scrimColor": "rgba(5, 11, 24, 0.85)"
  },
  "topHook": "Short compelling 2-4 word hook (e.g. 'I know you' or 'Faithful & True')",
  "subtitleHook": "Optional cursive script accent phrase (e.g. 'always with me' or 'His hand fulfilled it')",
  "highlightPhrase": "Exact 3-6 words from the verse text to emphasize in glowing gold",
  "dividerSymbol": "—  ✝  —",
  "imagePrompt": "Detailed 8K photorealistic image-generation prompt for DALL-E 3 / Imagen. Emphasize cinematic lighting, photorealism, textures, Rembrandt lighting, and pure scenery with ABSOLUTELY ZERO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS.",
  "devotionalCaption": "Inspiring 2-sentence devotional reflection for social media",
  "hashtags": ["#Faith", "#BibleVerse", "#Scripture"],
  "designRationale": "Why this composition, visual subject, and typography placement were selected"
}`;

    const userPrompt = `Scripture Reference: ${input.verseReference}
Verse Text: "${input.verseText}"
Language Mode: ${input.language}
Poster Purpose: ${input.purposeOrTheme}
Preferred Translation: ${input.translation || 'Canonical'}
Desired Atmosphere: ${input.atmosphere || 'Heavenly, comforting and awe-inspiring'}
Visual Preferences: ${input.visualPreferences || 'Biblical authenticity, dramatic lighting'}
Additional Caption Request: ${input.additionalCaption || 'None'}`;

    const briefResult = await router.generateText({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      temperature: 0.7
    }, 'creative_brief');

    let brief: any = {};
    try {
      brief = JSON.parse(briefResult.data);
    } catch {
      brief = {
        visualConcept: 'Celestial golden light pouring through ancient biblical landscape',
        textArea: 'right_side',
        topHook: 'Faith & Promise',
        highlightPhrase: input.verseText.split(/[,.;:]/)[0] || 'Blessed be God',
        imagePrompt: `Photorealistic 8K cinematic biblical vista representing ${input.verseReference}: ${input.purposeOrTheme}. Golden hour rim lighting, atmospheric depth, zero text, no words, no letters.`,
        devotionalCaption: 'May this Word bless your heart and renew your strength in Christ today.',
        hashtags: ['#BibleVerse', '#DailyScripture', '#Faith']
      };
    }

    // 2. Generate Artwork with AI (DALL-E 3 / Imagen 3)
    let artworkUrl = '';
    let imageProvider = 'openai';
    try {
      const imgRes = await router.generateImage({
        prompt: brief.imagePrompt,
        aspectRatio: input.aspectRatio,
        style: 'photorealistic'
      });
      artworkUrl = imgRes.imageUrl || '';
      imageProvider = imgRes.provider;
    } catch (imgErr: any) {
      console.warn('Live image generation failed, using curated studio background:', imgErr.message);
      if (/jesus|embrace|shepherd|comfort/i.test(brief.visualConcept || input.visualPreferences || '')) {
        artworkUrl = '/presets/jesus_embrace.jpg';
      } else {
        artworkUrl = '/presets/solomon_temple.jpg';
      }
    }

    // 3. Construct Dynamic Typography Overlays following AI Safe Area
    const texts: any[] = [];
    const isRightSide = brief.textArea === 'right_side';

    if (isRightSide) {
      if (brief.topHook) {
        texts.push({
          id: 'hook1',
          text: brief.topHook,
          x: 74,
          y: 14,
          fontSize: 32,
          fontFamily: "'Cinzel', Georgia, serif",
          color: brief.colorPalette?.primary || '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }
      if (brief.subtitleHook) {
        texts.push({
          id: 'hook2',
          text: brief.subtitleHook,
          x: 74,
          y: 20,
          fontSize: 24,
          fontFamily: "'Brush Script MT', 'Dancing Script', 'Playfair Display', cursive, serif",
          color: '#FFFFFF',
          fontWeight: '500',
          align: 'center',
          shadow: true
        });
        texts.push({
          id: 'swoosh',
          text: '⎯⎯⎯⎯⎯⎯',
          x: 74,
          y: 23,
          fontSize: 14,
          color: brief.colorPalette?.accent || '#D4AF37',
          align: 'center',
          shadow: true
        });
      }

      if (brief.highlightPhrase) {
        texts.push({
          id: 'highlight',
          text: brief.highlightPhrase,
          x: 74,
          y: 54,
          fontSize: 21,
          fontFamily: "'Cinzel', 'Noto Sans Tamil', serif",
          color: brief.colorPalette?.primary || '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      let remainingText = input.verseText;
      if (brief.highlightPhrase && remainingText.toLowerCase().includes(brief.highlightPhrase.toLowerCase())) {
        remainingText = remainingText.replace(new RegExp(brief.highlightPhrase, 'i'), '').trim();
        if (remainingText.startsWith(',') || remainingText.startsWith(';')) remainingText = remainingText.substring(1).trim();
      }

      texts.push({
        id: 'body',
        text: remainingText,
        x: 74,
        y: 63,
        fontSize: 17,
        fontFamily: "'Cinzel', 'Noto Sans Tamil', serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      texts.push({
        id: 'divider',
        text: brief.dividerSymbol || '—  ✝  —',
        x: 74,
        y: 77,
        fontSize: 16,
        color: brief.colorPalette?.accent || '#D4AF37',
        align: 'center',
        shadow: true
      });

      texts.push({
        id: 'ref',
        text: input.verseReference,
        x: 74,
        y: 82,
        fontSize: 18,
        fontFamily: "'Cinzel', 'Noto Sans Tamil', sans-serif",
        color: brief.colorPalette?.primary || '#E6CA65',
        fontWeight: '800',
        align: 'center',
        shadow: true,
        letterSpacing: 2
      });
    } else {
      texts.push({
        id: 'header',
        text: brief.topHook ? `— ${brief.topHook.toUpperCase()} —` : '— HOLY BIBLE VERSE —',
        x: 50,
        y: 10,
        fontSize: 18,
        fontFamily: "'Cinzel', Georgia, serif",
        color: brief.colorPalette?.primary || '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true,
        letterSpacing: 3
      });

      if (brief.highlightPhrase) {
        texts.push({
          id: 'highlight',
          text: brief.highlightPhrase,
          x: 50,
          y: 22,
          fontSize: 24,
          fontFamily: "'Cinzel', 'Noto Sans Tamil', serif",
          color: brief.colorPalette?.primary || '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      texts.push({
        id: 'body',
        text: input.verseText,
        x: 50,
        y: brief.highlightPhrase ? 32 : 26,
        fontSize: 20,
        fontFamily: "'Cinzel', 'Noto Sans Tamil', serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      texts.push({
        id: 'divider',
        text: brief.dividerSymbol || '—  ❖  ⚜  ❖  —',
        x: 50,
        y: 56,
        fontSize: 17,
        color: brief.colorPalette?.accent || '#D4AF37',
        align: 'center',
        shadow: true
      });

      texts.push({
        id: 'ref',
        text: `— ${input.verseReference} —`,
        x: 50,
        y: 72,
        fontSize: 20,
        fontFamily: "'Cinzel', 'Noto Sans Tamil', sans-serif",
        color: brief.colorPalette?.primary || '#E6CA65',
        fontWeight: '800',
        align: 'center',
        shadow: true
      });
    }

    // 4. Composite Final High-Res PNG with Sharp
    const compositeBuffer = await ImageCompositionService.composeImage({
      type: 'bible_poster',
      aspectRatio: input.aspectRatio,
      scrimType: isRightSide ? 'right' : 'top',
      background: {
        type: artworkUrl.startsWith('http') || artworkUrl.startsWith('data:') ? 'image' : 'preset',
        value: artworkUrl.startsWith('http') || artworkUrl.startsWith('data:') ? artworkUrl : artworkUrl.includes('jesus') ? 'jesus_embrace' : 'solomon_temple'
      },
      texts,
      images: []
    });

    const finalDataUrl = `data:image/png;base64,${compositeBuffer.toString('base64')}`;
    const durationMs = Date.now() - startTime;

    return res.json({
      success: true,
      creativeBrief: brief,
      artworkUrl,
      finalDataUrl,
      texts,
      aspectRatio: input.aspectRatio,
      dimensions: ImageCompositionService.getDimensions(input.aspectRatio),
      durationMs
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/thumbnail-ai (Full AI Creative Pipeline for YouTube Thumbnails)
generateRouter.post('/thumbnail-ai', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const input = thumbnailAISchema.parse(req.body);
    const router = await createRouterForUser(userId);

    const startTime = Date.now();

    const systemPrompt = `You are a world-class YouTube Creative Director specializing in 2026 high-CTR viral thumbnails.
Analyze the video title, content summary, target audience, and emotional tone.
Craft a high-CTR visual thumbnail strategy with striking clarity, emotional tension, and maximum mobile readability.
Determine:
1. A punchy headline under 5 words that grabs attention instantly.
2. A short subtitle hook.
3. Whether an attention badge (e.g. '🔥 MUST WATCH', '⚠️ WARNING') is genuinely beneficial or if clean composition is better (set badge to null if not needed).
4. Subject positioning, facial expressions, and cinematic rim lighting.
5. High-contrast color palette with 3D text outline.
6. A detailed text-free 16:9 image generation prompt with clean negative space on the left side for bold typography.
Respond with pure JSON only matching this schema:
{
  "headline": "PUNCHY TITLE (UPPERCASE, UNDER 5 WORDS)",
  "subtitle": "Short compelling punchline",
  "badge": "🔥 MUST WATCH" | null,
  "cta": "WATCH NOW" | null,
  "visualSubject": "Description of subject, facial expression, and action",
  "lighting": "Lighting details (e.g., dramatic studio neon rim light, volumetric glow)",
  "composition": "Visual balance with left 40% reserved for bold text",
  "colorTheme": {
    "titleFill": "#FFE600",
    "titleStroke": "#000000",
    "strokeWidth": 8,
    "subtitleColor": "#FFFFFF"
  },
  "imagePrompt": "Detailed 16:9 cinematic widescreen prompt for DALL-E 3. Ultra-vivid, high contrast, dramatic studio lighting, clean spacious area on the left for text overlay, photorealistic, 8K, ZERO TEXT, NO LETTERS, NO WORDS.",
  "ctrRationale": "1-2 sentences explaining why this concept will maximize click-through rate"
}`;

    const userPrompt = `Video Title: "${input.videoTitle}"
Content Summary: "${input.summary}"
Target Audience: ${input.targetAudience}
Language: ${input.language}
Channel Name: ${input.channelName || 'Faith Media'}
Emotional Tone: ${input.tone || 'High energy, urgent and faith-filled'}
Visual Preferences: ${input.visualPreferences || 'Cinematic realism, high contrast'}`;

    const briefResult = await router.generateText({
      systemPrompt,
      userPrompt,
      responseFormat: 'json',
      temperature: 0.7
    }, 'creative_brief');

    let brief: any = {};
    try {
      brief = JSON.parse(briefResult.data);
    } catch {
      brief = {
        headline: input.videoTitle.toUpperCase().split(' ').slice(0, 4).join(' '),
        subtitle: input.summary.slice(0, 40),
        badge: '🔥 MUST WATCH',
        colorTheme: { titleFill: '#FFE600', titleStroke: '#000000', strokeWidth: 8, subtitleColor: '#FFFFFF' },
        imagePrompt: `Ultra-dynamic 2026 YouTube thumbnail background for ${input.videoTitle}. High contrast, dramatic lighting, clean negative space on the left, 16:9, 8k, zero text.`,
        ctrRationale: 'Bold high-contrast title ensures high click-through rate on mobile search feeds.'
      };
    }

    // 2. Generate Artwork with AI (16:9)
    let artworkUrl = '';
    try {
      const imgRes = await router.generateImage({
        prompt: brief.imagePrompt,
        aspectRatio: '16:9',
        style: 'cinematic'
      });
      artworkUrl = imgRes.imageUrl || '';
    } catch (imgErr: any) {
      console.warn('Live thumbnail image generation fallback:', imgErr.message);
      artworkUrl = 'cinematic_bold';
    }

    // 3. Build High-CTR Typography Overlays
    const texts: any[] = [];

    if (brief.badge) {
      texts.push({
        id: 'badge',
        text: brief.badge,
        x: 8,
        y: 15,
        fontSize: 18,
        fontFamily: "'Inter', sans-serif",
        color: '#FFFFFF',
        fontWeight: '900',
        align: 'left',
        shadow: true,
        stroke: '#000000',
        strokeWidth: 4,
        backgroundColor: 'rgba(255, 30, 60, 0.95)'
      });
    }

    texts.push({
      id: 'title',
      text: brief.headline || input.videoTitle.toUpperCase(),
      x: 8,
      y: brief.badge ? 32 : 24,
      fontSize: 56,
      fontFamily: input.language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
      color: brief.colorTheme?.titleFill || '#FFE600',
      fontWeight: '900',
      align: 'left',
      shadow: true,
      stroke: brief.colorTheme?.titleStroke || '#000000',
      strokeWidth: brief.colorTheme?.strokeWidth || 8
    });

    if (brief.subtitle) {
      texts.push({
        id: 'subtitle',
        text: brief.subtitle,
        x: 8,
        y: brief.badge ? 55 : 48,
        fontSize: 28,
        fontFamily: input.language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
        color: brief.colorTheme?.subtitleColor || '#FFFFFF',
        fontWeight: '700',
        align: 'left',
        shadow: true,
        stroke: '#000000',
        strokeWidth: 4
      });
    }

    if (brief.cta) {
      texts.push({
        id: 'cta',
        text: `▶ ${brief.cta}`,
        x: 8,
        y: brief.badge ? 74 : 68,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        color: '#FFFFFF',
        fontWeight: '800',
        align: 'left',
        shadow: true,
        stroke: '#000000',
        strokeWidth: 4
      });
    }

    if (input.channelName) {
      texts.push({
        id: 'channel',
        text: input.channelName.toUpperCase(),
        x: 8,
        y: 88,
        fontSize: 15,
        fontFamily: "'Inter', sans-serif",
        color: '#D4AF37',
        fontWeight: '700',
        align: 'left',
        shadow: true
      });
    }

    // 4. Composite 1280x720 PNG
    const compositeBuffer = await ImageCompositionService.composeImage({
      type: 'youtube_thumbnail',
      aspectRatio: '16:9',
      background: {
        type: artworkUrl.startsWith('http') || artworkUrl.startsWith('data:') ? 'image' : 'preset',
        value: artworkUrl
      },
      texts,
      images: []
    });

    const finalDataUrl = `data:image/png;base64,${compositeBuffer.toString('base64')}`;
    const durationMs = Date.now() - startTime;

    return res.json({
      success: true,
      creativeBrief: brief,
      artworkUrl,
      finalDataUrl,
      texts,
      aspectRatio: '16:9',
      dimensions: { width: 1280, height: 720 },
      durationMs
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/generate/regenerate-text (Re-composite text onto artwork without regenerating image)
generateRouter.post('/regenerate-text', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = regenerateTextSchema.parse(req.body);

    const compositeBuffer = await ImageCompositionService.composeImage({
      type: input.type,
      aspectRatio: input.aspectRatio,
      scrimType: input.scrimType || 'right',
      background: {
        type: input.artworkUrl.startsWith('http') || input.artworkUrl.startsWith('data:') ? 'image' : 'preset',
        value: input.artworkUrl
      },
      texts: input.texts,
      images: []
    });

    const finalDataUrl = `data:image/png;base64,${compositeBuffer.toString('base64')}`;

    return res.json({
      success: true,
      finalDataUrl,
      dimensions: ImageCompositionService.getDimensions(input.aspectRatio)
    });
  } catch (err) {
    next(err);
  }
});
