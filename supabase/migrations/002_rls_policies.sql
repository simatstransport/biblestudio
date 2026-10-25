-- ====================================================================
-- FAITH & CREATOR STUDIO - ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;


-- 2. Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);


-- 3. User AI Settings Policies (Crucial for API key isolation)
CREATE POLICY "Users can view their own AI settings"
    ON public.user_ai_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings"
    ON public.user_ai_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings"
    ON public.user_ai_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI settings"
    ON public.user_ai_settings FOR DELETE
    USING (auth.uid() = user_id);


-- 4. Creative Projects Policies
CREATE POLICY "Users can manage their own creative projects"
    ON public.creative_projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 5. Project Assets Policies
CREATE POLICY "Users can manage their own project assets"
    ON public.project_assets FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 6. Generated Images Policies
CREATE POLICY "Users can manage their own generated images"
    ON public.generated_images FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 7. Verse Library Policies (Canonical text readable by all users)
CREATE POLICY "Anyone authenticated can read verified verses"
    ON public.verse_library FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Public anon can read verified verses"
    ON public.verse_library FOR SELECT
    TO anon
    USING (true);


-- 8. Verse Projects Policies
CREATE POLICY "Users can manage verse project details for their own projects"
    ON public.verse_projects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.creative_projects
            WHERE creative_projects.id = verse_projects.project_id
            AND creative_projects.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.creative_projects
            WHERE creative_projects.id = verse_projects.project_id
            AND creative_projects.user_id = auth.uid()
        )
    );


-- 9. Generation History Policies
CREATE POLICY "Users can view their own generation history"
    ON public.generation_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own generation history"
    ON public.generation_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
