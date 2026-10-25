# Faith & Creator Studio — Supabase Complete Setup Guide

This guide provides step-by-step instructions to configure your Supabase backend for **Faith & Creator Studio**.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Enter:
   - **Name**: `Faith-Creator-Studio`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Select the region closest to you or your target audience.
4. Click **Create new project** and wait ~2 minutes for provisioning.

---

## 2. Obtain Your API Credentials

1. In your Supabase dashboard, click **Project Settings** (gear icon in the left sidebar).
2. Click **API**.
3. Copy the following values into your `.env` file (in the project root):
   - **Project URL** ➔ `SUPABASE_URL` (and `VITE_SUPABASE_URL`)
   - **Project API keys -> anon (public)** ➔ `SUPABASE_ANON_KEY` (and `VITE_SUPABASE_ANON_KEY`)
   - **Project API keys -> service_role (secret)** ➔ `SUPABASE_SERVICE_ROLE_KEY`

Example `.env`:
```env
SUPABASE_URL=https://abcdefghijklm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Run the Database SQL Migrations

Open the **SQL Editor** in the left sidebar of your Supabase dashboard and run the following queries. You can run each migration file located in `supabase/migrations/` or copy the consolidated SQL below.

### Step 3.1: Run Schema & Automatic Profile Trigger
Paste and execute the contents of `supabase/migrations/001_initial_schema.sql`:
- Creates `profiles`, `user_ai_settings`, `creative_projects`, `project_assets`, `generated_images`, `verse_library`, `verse_projects`, `generation_history`.
- Creates automatic user profile trigger on Google OAuth sign up.

### Step 3.2: Enable Row Level Security (RLS)
Paste and execute the contents of `supabase/migrations/002_rls_policies.sql`:
- Protects every user's designs, encrypted keys, and project assets so no user can access another user's data.

### Step 3.3: Configure Storage Buckets
Paste and execute `supabase/migrations/003_storage_setup.sql`:
- Creates `studio-assets` and `generated-images` buckets with RLS rules.

### Step 3.4: Seed Verified Canonical Scripture (English + Tamil)
Paste and execute `supabase/migrations/004_seed_verified_verses.sql`:
- Inserts canonical verified Scripture across all 15 topics in English (KJV) and Tamil (BSI Union Version).

---

## 4. Supabase Storage Verification

1. In the Supabase left sidebar, click **Storage**.
2. Verify that two buckets exist:
   - `studio-assets` (Public: Yes)
   - `generated-images` (Public: Yes)
3. If not created by the SQL script, click **New Bucket**, type `studio-assets`, toggle **Public bucket** ON, and save. Repeat for `generated-images`.

---

## 5. Enable Google OAuth in Supabase

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for full instructions on setting up Google Cloud Console and linking it in **Authentication -> Providers -> Google**.
