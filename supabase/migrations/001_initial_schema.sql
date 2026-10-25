-- ====================================================================
-- FAITH & CREATOR STUDIO - SUPABASE DATABASE SCHEMA MIGRATION 001
-- ====================================================================

-- 1. Profiles Table (linked to Supabase Auth user)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for profiles email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Automatic Profile Creation Trigger on Supabase Auth SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. User AI Settings Table (Stores AES-256-GCM encrypted API keys)
CREATE TABLE IF NOT EXISTS public.user_ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    encrypted_openai_key TEXT,
    encrypted_gemini_key TEXT,
    primary_provider TEXT NOT NULL DEFAULT 'openai' CHECK (primary_provider IN ('openai', 'gemini')),
    fallback_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (fallback_provider IN ('openai', 'gemini', 'none')),
    openai_model TEXT NOT NULL DEFAULT 'gpt-4o',
    gemini_model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    openai_status TEXT NOT NULL DEFAULT 'unconfigured' CHECK (openai_status IN ('unconfigured', 'connected', 'invalid', 'quota_exceeded')),
    gemini_status TEXT NOT NULL DEFAULT 'unconfigured' CHECK (gemini_status IN ('unconfigured', 'connected', 'invalid', 'quota_exceeded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_ai_settings_user_id ON public.user_ai_settings(user_id);


-- 3. Creative Projects Table
CREATE TABLE IF NOT EXISTS public.creative_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_type TEXT NOT NULL CHECK (project_type IN ('youtube_thumbnail', 'bible_poster')),
    title TEXT NOT NULL,
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    design_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'rendered', 'completed', 'archived')),
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_creative_projects_user_id ON public.creative_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_projects_project_type ON public.creative_projects(project_type);
CREATE INDEX IF NOT EXISTS idx_creative_projects_created_at ON public.creative_projects(created_at DESC);


-- 4. Project Assets Table
CREATE TABLE IF NOT EXISTS public.project_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.creative_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'subject', 'background', 'rendered')),
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON public.project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_user_id ON public.project_assets(user_id);


-- 5. Generated Images Table
CREATE TABLE IF NOT EXISTS public.generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.creative_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    background_path TEXT,
    final_image_path TEXT NOT NULL,
    image_format TEXT NOT NULL DEFAULT 'png',
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    provider TEXT,
    model TEXT,
    generation_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_generated_images_project_id ON public.generated_images(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images(user_id);


-- 6. Verse Library Table (Verified canonical scripture)
CREATE TABLE IF NOT EXISTS public.verse_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER,
    translation TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('english', 'tamil')),
    topic TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    source_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'unverified')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_verse_library_topic ON public.verse_library(topic);
CREATE INDEX IF NOT EXISTS idx_verse_library_book_chapter ON public.verse_library(book, chapter);
CREATE INDEX IF NOT EXISTS idx_verse_library_language ON public.verse_library(language);


-- 7. Verse Projects Details Table
CREATE TABLE IF NOT EXISTS public.verse_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.creative_projects(id) ON DELETE CASCADE UNIQUE,
    verse_reference TEXT NOT NULL,
    english_translation TEXT NOT NULL DEFAULT 'KJV',
    tamil_translation TEXT NOT NULL DEFAULT 'Tamil BSI',
    english_text TEXT,
    tamil_text TEXT,
    poster_language_mode TEXT NOT NULL CHECK (poster_language_mode IN ('english', 'tamil', 'bilingual')),
    caption TEXT,
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_verse_projects_project_id ON public.verse_projects(project_id);


-- 8. Generation History Table (Audit log for AI and fallback monitoring)
CREATE TABLE IF NOT EXISTS public.generation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.creative_projects(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('title_suggestions', 'caption_generation', 'image_generation', 'final_render', 'prompt_enhancement')),
    fallback_used BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'fallback_recovered')),
    duration_ms INTEGER,
    error_category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON public.generation_history(created_at DESC);
