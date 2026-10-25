import { z } from 'zod';

export const aiSettingsSchema = z.object({
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  primaryProvider: z.enum(['openai', 'gemini']).default('openai'),
  fallbackProvider: z.enum(['openai', 'gemini', 'none']).default('gemini'),
  openaiModel: z.string().default('gpt-4o'),
  geminiModel: z.string().default('gemini-1.5-flash')
});

export const testProviderSchema = z.object({
  provider: z.enum(['openai', 'gemini']),
  apiKey: z.string().optional()
});

export const thumbnailBriefSchema = z.object({
  mainTitle: z.string().min(1, 'Title is required').max(150, 'Title is too long'),
  subtitle: z.string().max(200).optional(),
  callToAction: z.string().max(60).optional(),
  channelName: z.string().max(80).optional(),
  language: z.enum(['english', 'tamil', 'bilingual']).default('english'),
  theme: z.string().default('Cinematic'),
  targetAudience: z.string().optional(),
  additionalInstructions: z.string().max(500).optional(),
  organizationName: z.string().optional(),
  venue: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  socialHandle: z.string().optional(),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  timezone: z.string().optional()
});

export const verseCaptionSchema = z.object({
  verseReference: z.string().min(1, 'Verse reference is required'),
  verseText: z.string().min(1, 'Verse text is required'),
  language: z.enum(['english', 'tamil', 'bilingual']).default('english'),
  topic: z.string().default('faith')
});

export const imageGenerationSchema = z.object({
  prompt: z.string().min(3, 'Prompt is required'),
  aspectRatio: z.enum(['16:9', '4:5', '1:1', '9:16']).default('16:9'),
  style: z.string().optional(),
  type: z.enum(['thumbnail_background', 'spiritual_background']).default('thumbnail_background')
});

export const textOverlaySchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number(), // percentage 0-100 or pixels
  y: z.number(),
  fontSize: z.number().default(48),
  fontFamily: z.string().default('Inter'),
  color: z.string().default('#FFFFFF'),
  fontWeight: z.string().default('bold'),
  align: z.enum(['left', 'center', 'right']).default('left'),
  shadow: z.boolean().default(true),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  backgroundColor: z.string().optional(),
  letterSpacing: z.number().optional()
});

export const imageOverlaySchema = z.object({
  id: z.string(),
  type: z.enum(['logo', 'subject']),
  url: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  borderRadius: z.number().default(0),
  glow: z.boolean().optional(),
  border: z.string().optional()
});

export const renderFinalSchema = z.object({
  projectId: z.string().optional(),
  title: z.string().default('Untitled Project'),
  type: z.enum(['youtube_thumbnail', 'bible_poster']),
  aspectRatio: z.enum(['16:9', '4:5', '1:1', '9:16']).default('16:9'),
  background: z.object({
    type: z.enum(['color', 'gradient', 'image', 'preset']),
    value: z.string(), // color hex, image URL, or preset id
    overlayColor: z.string().optional(),
    opacity: z.number().min(0).max(1).default(1)
  }),
  texts: z.array(textOverlaySchema).default([]),
  images: z.array(imageOverlaySchema).default([]),
  contactInfo: z.object({
    enabled: z.boolean().default(false),
    text: z.string().optional()
  }).optional(),
  eventInfo: z.object({
    enabled: z.boolean().default(false),
    text: z.string().optional()
  }).optional()
});
