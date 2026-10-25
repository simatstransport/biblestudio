export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AISettings {
  configured: boolean;
  openai: {
    configured: boolean;
    maskedKey: string;
    model: string;
    status: 'unconfigured' | 'connected' | 'invalid' | 'quota_exceeded';
  };
  gemini: {
    configured: boolean;
    maskedKey: string;
    model: string;
    status: 'unconfigured' | 'connected' | 'invalid' | 'quota_exceeded';
  };
  primaryProvider: 'openai' | 'gemini';
  fallbackProvider: 'openai' | 'gemini' | 'none';
}

export interface PairedVerse {
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  topic: string;
  english: {
    translation: string;
    text: string;
  };
  tamil: {
    translation: string;
    text: string;
  };
  isVerified: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage (0-100) or pixels
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  align: 'left' | 'center' | 'right';
  shadow: boolean;
  backgroundColor?: string;
}

export interface ImageOverlay {
  id: string;
  type: 'logo' | 'subject';
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface ProjectData {
  id?: string;
  title: string;
  project_type: 'youtube_thumbnail' | 'bible_poster';
  status: 'draft' | 'rendered' | 'completed';
  is_favorite?: boolean;
  input_data: any;
  design_preferences: {
    aspectRatio: '16:9' | '4:5' | '1:1' | '9:16';
    background: {
      type: 'color' | 'gradient' | 'image' | 'preset';
      value: string;
      overlayColor?: string;
      opacity?: number;
    };
    texts: TextOverlay[];
    images: ImageOverlay[];
    contactInfo?: {
      enabled: boolean;
      text?: string;
    };
    eventInfo?: {
      enabled: boolean;
      text?: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface HistoryItem {
  id: string;
  provider: 'openai' | 'gemini';
  model: string;
  task_type: string;
  fallback_used: boolean;
  status: 'success' | 'failed' | 'fallback_recovered';
  duration_ms: number;
  error_category?: string;
  created_at: string;
}
