-- ====================================================================
-- FAITH & CREATOR STUDIO — COMPLETE ONE-CLICK MASTER SQL MIGRATION
-- Project: cegivfqdxcuoljxpezzt.supabase.co
-- Instructions: Copy this ENTIRE file into Supabase SQL Editor and click RUN
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE & AUTOMATIC SIGNUP TRIGGER
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

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


-- --------------------------------------------------------------------
-- 2. USER AI SETTINGS TABLE (AES-256-GCM Encrypted Keys)
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 3. CREATIVE PROJECTS TABLE
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 4. PROJECT ASSETS TABLE
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 5. GENERATED IMAGES TABLE
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 6. VERSE LIBRARY TABLE (Verified Scripture)
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 7. VERSE PROJECTS DETAILS TABLE
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 8. GENERATION HISTORY TABLE (Audit Trail)
-- --------------------------------------------------------------------
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


-- --------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User AI Settings Policies
DROP POLICY IF EXISTS "Users can view their own AI settings" ON public.user_ai_settings;
CREATE POLICY "Users can view their own AI settings" ON public.user_ai_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own AI settings" ON public.user_ai_settings;
CREATE POLICY "Users can insert their own AI settings" ON public.user_ai_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own AI settings" ON public.user_ai_settings;
CREATE POLICY "Users can update their own AI settings" ON public.user_ai_settings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own AI settings" ON public.user_ai_settings;
CREATE POLICY "Users can delete their own AI settings" ON public.user_ai_settings FOR DELETE USING (auth.uid() = user_id);

-- Creative Projects Policies
DROP POLICY IF EXISTS "Users can manage their own creative projects" ON public.creative_projects;
CREATE POLICY "Users can manage their own creative projects" ON public.creative_projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Project Assets Policies
DROP POLICY IF EXISTS "Users can manage their own project assets" ON public.project_assets;
CREATE POLICY "Users can manage their own project assets" ON public.project_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Generated Images Policies
DROP POLICY IF EXISTS "Users can manage their own generated images" ON public.generated_images;
CREATE POLICY "Users can manage their own generated images" ON public.generated_images FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verse Library Policies
DROP POLICY IF EXISTS "Anyone can read verified verses" ON public.verse_library;
CREATE POLICY "Anyone can read verified verses" ON public.verse_library FOR SELECT USING (true);

-- Verse Projects Policies
DROP POLICY IF EXISTS "Users can manage verse project details for their own projects" ON public.verse_projects;
CREATE POLICY "Users can manage verse project details for their own projects" ON public.verse_projects FOR ALL USING (
    EXISTS (SELECT 1 FROM public.creative_projects WHERE creative_projects.id = verse_projects.project_id AND creative_projects.user_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.creative_projects WHERE creative_projects.id = verse_projects.project_id AND creative_projects.user_id = auth.uid())
);

-- Generation History Policies
DROP POLICY IF EXISTS "Users can view their own generation history" ON public.generation_history;
CREATE POLICY "Users can view their own generation history" ON public.generation_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert to their own generation history" ON public.generation_history;
CREATE POLICY "Users can insert to their own generation history" ON public.generation_history FOR INSERT WITH CHECK (auth.uid() = user_id);


-- --------------------------------------------------------------------
-- 10. STORAGE BUCKETS SETUP
-- --------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('studio-assets', 'studio-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('generated-images', 'generated-images', true, 20971520, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
DROP POLICY IF EXISTS "Users can upload assets to their own folder" ON storage.objects;
CREATE POLICY "Users can upload assets to their own folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'studio-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public read for studio-assets" ON storage.objects;
CREATE POLICY "Public read for studio-assets" ON storage.objects FOR SELECT USING (bucket_id = 'studio-assets');

DROP POLICY IF EXISTS "Users can save generated images to their own folder" ON storage.objects;
CREATE POLICY "Users can save generated images to their own folder" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'generated-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Public read for generated-images" ON storage.objects;
CREATE POLICY "Public read for generated-images" ON storage.objects FOR SELECT USING (bucket_id = 'generated-images');


-- --------------------------------------------------------------------
-- 11. VERIFIED CANONICAL SCRIPTURE SEED DATA (English KJV & Tamil BSI)
-- --------------------------------------------------------------------
INSERT INTO public.verse_library 
    (book, chapter, verse_start, verse_end, translation, language, topic, verse_text, verification_status)
VALUES
-- Topic: FAITH
('Hebrews', 11, 1, NULL, 'KJV', 'english', 'faith', 
 'Now faith is the substance of things hoped for, the evidence of things not seen.', 'verified'),
('Hebrews', 11, 1, NULL, 'Tamil BSI', 'tamil', 'faith', 
 'விசுவாசமானது நம்பப்படுகிறவைகளின் உறுதியும், காணப்படாதவைகளின் நிச்சயமுமாயிருக்கிறது.', 'verified'),

('2 Corinthians', 5, 7, NULL, 'KJV', 'english', 'faith', 
 'For we walk by faith, not by sight.', 'verified'),
('2 Corinthians', 5, 7, NULL, 'Tamil BSI', 'tamil', 'faith', 
 'பார்வையினாலே நடவாமல், விசுவாசத்தினாலே நடக்கிறோம்.', 'verified'),

-- Topic: HOPE
('Jeremiah', 29, 11, NULL, 'KJV', 'english', 'hope', 
 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.', 'verified'),
('Jeremiah', 29, 11, NULL, 'Tamil BSI', 'tamil', 'hope', 
 'நீங்கள் எதிர்பார்த்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு நான் உங்களைக்குறித்து நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்; அவைகள் தீமைக்கல்ல, சமாதானத்துக்கேதுவான நினைவுகளே.', 'verified'),

('Romans', 15, 13, NULL, 'KJV', 'english', 'hope', 
 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.', 'verified'),
('Romans', 15, 13, NULL, 'Tamil BSI', 'tamil', 'hope', 
 'பரிசுத்த ஆவியின் பலத்தினாலே உங்களுக்கு நம்பிக்கை பெருகும்படிக்கு, நம்பிக்கையின் தேவன் விசுவாசத்தினால் உண்டாகும் எல்லாவித சந்தோஷத்தினாலும் சமாதானத்தினாலும் உங்களை நிரப்புவாராக.', 'verified'),

-- Topic: GOD'S PROMISES
('Isaiah', 41, 10, NULL, 'KJV', 'english', 'promises', 
 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.', 'verified'),
('Isaiah', 41, 10, NULL, 'Tamil BSI', 'tamil', 'promises', 
 'நீ பயப்படாதே, நான் உன்னுடனே இருக்கிறேன்; திகையாதே, நான் உன் தேவன்; நான் உன்னைப் பலப்படுத்தி உனக்குச் சகாயம்பண்ணுவேன்; என் நீதியின் வலதுகரத்தினால் உன்னைத் தாங்குவேன்.', 'verified'),

('Joshua', 1, 9, NULL, 'KJV', 'english', 'promises', 
 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', 'verified'),
('Joshua', 1, 9, NULL, 'Tamil BSI', 'tamil', 'promises', 
 'நான் உனக்குக் கட்டளையிடவில்லையா? பலங்கொண்டு திடமனதாயிரு; திகையாதே, கலங்காதே, நீ போகும் இடமெல்லாம் உன் தேவனாகிய கர்த்தர் உன்னோடே இருக்கிறார் என்றார்.', 'verified'),

-- Topic: LOVE
('John', 3, 16, NULL, 'KJV', 'english', 'love', 
 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'verified'),
('John', 3, 16, NULL, 'Tamil BSI', 'tamil', 'love', 
 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.', 'verified'),

('1 Corinthians', 13, 13, NULL, 'KJV', 'english', 'love', 
 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.', 'verified'),
('1 Corinthians', 13, 13, NULL, 'Tamil BSI', 'tamil', 'love', 
 'இப்பொழுது விசுவாசம், நம்பிக்கை, அன்பு இந்த மூன்றும் நிலைத்திருக்கிறது; இவைகளில் அன்பே பெரியது.', 'verified'),

-- Topic: PRAYER
('Philippians', 4, 6, NULL, 'KJV', 'english', 'prayer', 
 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.', 'verified'),
('Philippians', 4, 6, NULL, 'Tamil BSI', 'tamil', 'prayer', 
 'நீங்கள் ஒன்றுக்குங் கவலைப்படாமல், எல்லாவற்றையுங்குறித்து உங்கள் விண்ணப்பங்களை ஸ்தோத்திரத்தோடே கூடிய ஜெபத்தினாலும் வேண்டுதலினாலும் தேவனுக்குத் தெரியப்படுத்துங்கள்.', 'verified'),

('Jeremiah', 33, 3, NULL, 'KJV', 'english', 'prayer', 
 'Call unto me, and I will answer thee, and shew thee great and mighty things, which thou knowest not.', 'verified'),
('Jeremiah', 33, 3, NULL, 'Tamil BSI', 'tamil', 'prayer', 
 'என்னை நோக்கிக் கூப்பிடு, அப்பொழுது நான் உனக்கு உத்தரவு கொடுத்து, நீ அறியாததும் உனக்கு எட்டாததுமான பெரிய காரியங்களை உனக்கு அறிவிப்பேன்.', 'verified'),

-- Topic: PEACE
('John', 14, 27, NULL, 'KJV', 'english', 'peace', 
 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', 'verified'),
('John', 14, 27, NULL, 'Tamil BSI', 'tamil', 'peace', 
 'சமாதானத்தை உங்களுக்கு வைத்துப்போகிறேன், என்னுடைய சமாதானத்தையே உங்களுக்குக் கொடுக்கிறேன்; உலகம் கொடுக்கிறபிரகாரம் நான் உங்களுக்குக் கொடுக்கிறதில்லை. உங்கள் இருதயம் கலங்காமலும் பயப்படாமலும் இருப்பதாக.', 'verified'),

('Philippians', 4, 7, NULL, 'KJV', 'english', 'peace', 
 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', 'verified'),
('Philippians', 4, 7, NULL, 'Tamil BSI', 'tamil', 'peace', 
 'அப்பொழுது, எல்லாப் புத்திக்கும் மேலான தேவசமாதானம் உங்கள் இருதயங்களையும் உங்கள் சிந்தைகளையும் கிறிஸ்து இயேசுவுக்குள் காத்துக்கொள்ளும்.', 'verified'),

-- Topic: STRENGTH
('Philippians', 4, 13, NULL, 'KJV', 'english', 'strength', 
 'I can do all things through Christ which strengtheneth me.', 'verified'),
('Philippians', 4, 13, NULL, 'Tamil BSI', 'tamil', 'strength', 
 'என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.', 'verified'),

('Isaiah', 40, 31, NULL, 'KJV', 'english', 'strength', 
 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.', 'verified'),
('Isaiah', 40, 31, NULL, 'Tamil BSI', 'tamil', 'strength', 
 'கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்; அவர்கள் ஓடினாலும் இளைப்படையார்கள், நடந்தாலும் சோர்ந்துபோகார்கள்.', 'verified'),

-- Topic: WISDOM
('James', 1, 5, NULL, 'KJV', 'english', 'wisdom', 
 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.', 'verified'),
('James', 1, 5, NULL, 'Tamil BSI', 'tamil', 'wisdom', 
 'உங்களில் ஒருவன் ஞானத்தில் குறைவுள்ளவனாயிருந்தால், யாவருக்கும் சம்பூரணமாய்க் கொடுக்கிறவரும் ஒருவரையும் கடிந்துகொள்ளாதவருமாகிய தேவனிடத்தில் கேட்கக்கடவன், அப்பொழுது அவனுக்குக் கொடுக்கப்படும்.', 'verified'),

('Proverbs', 3, 5, 6, 'KJV', 'english', 'wisdom', 
 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.', 'verified'),
('Proverbs', 3, 5, 6, 'Tamil BSI', 'tamil', 'wisdom', 
 'உன் சுயபுத்தியின்மேல் சாயாமல், உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிருந்து, உன் வழிகளிலெல்லாம் அவரை நினைத்துக்கொள்; அப்பொழுது அவர் உன் பாதைகளைச் செவ்வைப்படுத்துவார்.', 'verified'),

-- Topic: PROTECTION
('Psalm', 91, 1, 2, 'KJV', 'english', 'protection', 
 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.', 'verified'),
('Psalm', 91, 1, 2, 'Tamil BSI', 'tamil', 'protection', 
 'உன்னதமானவரின் மறைவிலிருக்கிறவன் சர்வவல்லவருடைய நிழலில் தங்குவான். நான் கர்த்தரை நோக்கி: நீர் என் அடைக்கலம், என் கோட்டை, என் தேவன், நான் நம்பியிருக்கிறவர் என்று சொல்லுவேன்.', 'verified'),

('Psalm', 23, 1, NULL, 'KJV', 'english', 'protection', 
 'The LORD is my shepherd; I shall not want.', 'verified'),
('Psalm', 23, 1, NULL, 'Tamil BSI', 'tamil', 'protection', 
 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.', 'verified'),

-- Topic: GRATITUDE
('1 Thessalonians', 5, 18, NULL, 'KJV', 'english', 'gratitude', 
 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.', 'verified'),
('1 Thessalonians', 5, 18, NULL, 'Tamil BSI', 'tamil', 'gratitude', 
 'எல்லாவற்றிலேயும் ஸ்தோத்திரஞ்செய்யுங்கள்; அப்படிச் செய்வதே கிறிஸ்து இயேசுவுக்குள் உங்களைக்குறித்து தேவனுடைய சித்தமாயிருக்கிறது.', 'verified'),

('Psalm', 100, 4, NULL, 'KJV', 'english', 'gratitude', 
 'Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.', 'verified'),
('Psalm', 100, 4, NULL, 'Tamil BSI', 'tamil', 'gratitude', 
 'அவர் வாசல்களில் துதியோடும், அவர் பிராகாரங்களில் புகழ்ச்சியோடும் பிரவேசித்து, அவரைத் துதித்து, அவருடைய நாமத்தை ஸ்தோத்தரியுங்கள்.', 'verified'),

-- Topic: GOD'S FAITHFULNESS
('Lamentations', 3, 22, 23, 'KJV', 'english', 'faithfulness', 
 'It is of the LORD''s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.', 'verified'),
('Lamentations', 3, 22, 23, 'Tamil BSI', 'tamil', 'faithfulness', 
 'நாம் நிர்மூலமாகாதிருக்கிறது கர்த்தருடைய கிருபையே, அவருடைய இரக்கங்களுக்கு முடிவே இல்லை. அவைகள் காலைதோறும் புதியவைகள்; உமது உண்மை பெரிதாயிருக்கிறது.', 'verified'),

-- Topic: ENCOURAGEMENT
('Matthew', 11, 28, NULL, 'KJV', 'english', 'encouragement', 
 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'verified'),
('Matthew', 11, 28, NULL, 'Tamil BSI', 'tamil', 'encouragement', 
 'வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.', 'verified'),

('2 Timothy', 1, 7, NULL, 'KJV', 'english', 'encouragement', 
 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', 'verified'),
('2 Timothy', 1, 7, NULL, 'Tamil BSI', 'tamil', 'encouragement', 
 'தேவன் நமக்கு பயமுள்ள ஆவியைக்கொடாமல், பலமும் அன்பும் தெளிந்த புத்தியுமுள்ள ஆவியையே கொடுத்திருக்கிறார்.', 'verified'),

-- Topic: SALVATION
('Romans', 10, 9, NULL, 'KJV', 'english', 'salvation', 
 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.', 'verified'),
('Romans', 10, 9, NULL, 'Tamil BSI', 'tamil', 'salvation', 
 'என்னவென்றால், கர்த்தராகிய இயேசுவை நீ உன் வாயினாலே அறிக்கையிட்டு, தேவன் அவரை மரித்தோரிலிருந்து எழுப்பினாரென்று உன் இருதயத்திலே விசுவாசித்தால் இரட்சிக்கப்படுவாய்.', 'verified'),

-- Topic: FORGIVENESS
('1 John', 1, 9, NULL, 'KJV', 'english', 'forgiveness', 
 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.', 'verified'),
('1 John', 1, 9, NULL, 'Tamil BSI', 'tamil', 'forgiveness', 
 'நம்முடைய பாவங்களை நாம் அறிக்கையிட்டால், பாவங்களை நமக்கு மன்னித்து எல்லா அநியாயத்தையுநீக்கி நம்மைச் சுத்திகரிப்பதற்கு அவர் உண்மையும் நீதியும் உள்ளவராயிருக்கிறார்.', 'verified'),

-- Topic: CHRISTIAN LIVING
('Romans', 12, 2, NULL, 'KJV', 'english', 'living', 
 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.', 'verified'),
('Romans', 12, 2, NULL, 'Tamil BSI', 'tamil', 'living', 
 'நீங்கள் இந்தப் பிரபஞ்சத்திற்கு ஒத்த வேஷந்தரியாமல், தேவனுடைய நன்மையும் பிரியமும் பரிபூரணமுமான சித்தம் இன்னதென்று பகுத்தறியத்தக்கதாக, உங்கள் மனம் புதிதாகிறதினாலே மறுரூபமாகுங்கள்.', 'verified')
ON CONFLICT DO NOTHING;
