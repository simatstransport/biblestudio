# Vercel Deployment Guide for Faith & Creator Studio

This repository is pre-configured for full-stack deployment on **Vercel** (`client/dist` frontend + serverless Express API).

---

## 1. Import Repository into Vercel

1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Faith & Creator Studio Initial Commit"
   git remote add origin https://github.com/your-username/faith-creator-studio.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New... ➔ Project**.
4. Select your `faith-creator-studio` repository and click **Import**.

---

## 2. Project Settings in Vercel

Vercel will detect `vercel.json` automatically:
- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`

---

## 3. Environment Variables in Vercel

In the Vercel import screen (or under **Project Settings ➔ Environment Variables**), add the following:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `ENCRYPTION_KEY` | `8f4b23c7a91e5d0824b619e48c73105dfa02b489c7216a3e5c91b7d840ef1a2c` | AES-256-GCM API key encryption |
| `SUPABASE_URL` | `https://cegivfqdxcuoljxpezzt.supabase.co` | Supabase backend connection |
| `SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Public client queries |
| `SUPABASE_SERVICE_ROLE_KEY` | `your_supabase_service_role_key` | Secure backend operations |
| `VITE_SUPABASE_URL` | `https://cegivfqdxcuoljxpezzt.supabase.co` | Frontend Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Frontend Supabase key |
| `DEFAULT_OPENAI_API_KEY` | `your_openai_api_key` | Your OpenAI admin key |
| `DEFAULT_GEMINI_API_KEY` | `your_gemini_api_key` | Your Gemini admin key |
| `NODE_ENV` | `production` | Production mode |

Click **Deploy**!

---

## 4. Update Supabase & Google with Your Vercel Domain

Once deployed, Vercel will give you a domain (e.g. `https://faith-creator-studio.vercel.app`):

### 4.1. Update Supabase
In Supabase Dashboard ➔ **Authentication** ➔ **URL Configuration**:
- **Site URL**: `https://faith-creator-studio.vercel.app`
- **Redirect URLs**: Add `https://faith-creator-studio.vercel.app/auth/callback`

### 4.2. Update Google Cloud Console
In Google Cloud Console ➔ **APIs & Services** ➔ **Credentials** ➔ Click your Web Client ID:
- **Authorized JavaScript origins**: Add `https://faith-creator-studio.vercel.app`
- **Authorized redirect URIs**: Verify `https://cegivfqdxcuoljxpezzt.supabase.co/auth/v1/callback` is present.
