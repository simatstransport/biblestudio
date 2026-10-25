<<<<<<< HEAD
# biblestudio
=======
# ✝ Faith & Creator Studio

> **AI Creative Studio for Professional YouTube Thumbnails & Bible Verse Posters**  
> Powered by Supabase Auth (Google OAuth), PostgreSQL RLS, Sharp typography composition, and an intelligent **OpenAI-First + Gemini-Fallback AI Router**.

---

## 🌟 Key Features

### 🎬 Dedicated Tool A: YouTube Thumbnail Creator
- **16:9 1280×720 Ultra-HD Format**: Designed for maximum Click-Through-Rate (CTR).
- **Logo Upload & Preserved Subject Likeness**: Upload channel logos (transparent PNG) and speaker/subject images without distortion.
- **Deterministic Typography Engine**: Text is composed accurately via Sharp/SVG overlay with zero AI spelling hallucinations.
- **AI Hook & Title Assistant**: Generates high-CTR title variations and visual background prompts.
- **Event & Contact Badges**: Toggleable date, time, venue, social handles, and contact numbers.
- **Safe-Area Overlay**: Live toggle to verify mobile safe margins and edge padding.

### 📖 Dedicated Tool B: Bible Verse Poster Creator
- **Option A: English Bible Poster**: Verified KJV Scripture with reverent typography and devotional reflections.
- **Option B: Tamil Bible Poster**: Verified canonical Tamil Scripture (BSI Union Version) with pristine Unicode typography.
- **Option C: Combined English + Tamil Poster**: Balanced bilingual layout with decorative dividers, automatic line wrapping, and font scaling.
- **15 Canonical Topics**: Faith, Hope, God's Promises, Love, Prayer, Peace, Forgiveness, Salvation, Wisdom, Strength, Protection, Gratitude, God's Faithfulness, Encouragement, and Christian Living.
- **Spiritual Background Styles**: Heavenly Golden Light, Sunrise Mountains, Starry Night, Cross Silhouette, Deep Navy & Gold.
- **Multiple Aspect Ratios**: 1080×1350 (4:5 Portrait default), 1080×1080 (1:1 Square), 1080×1920 (9:16 Story).

### 🤖 OpenAI-First, Gemini-Fallback AI Router
- **Default Priority**: OpenAI primary, Google Gemini fallback.
- **Automatic Failover**: Routes around 429 quota exhaustion and transient 5xx timeouts seamlessly.
- **Strict Security**: Authenticated AES-256-GCM encryption at rest; secrets are never logged or returned to the browser.
- **Audit Telemetry**: Real-time logging of durations, models, and fallback reasons to `generation_history`.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- npm (v9+)

### 2. Installation
Install all dependencies for root, server, and client:
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 32-byte hex encryption key
ENCRYPTION_KEY=8f4b23c7a91e5d0824b619e48c73105dfa02b489c7216a3e5c91b7d840ef1a2c

# Supabase Settings (From Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Fallback/Admin AI keys (optional server defaults)
DEFAULT_OPENAI_API_KEY=sk-proj-...
DEFAULT_GEMINI_API_KEY=AQ.Ab...
```

### 4. Database Setup
Follow the step-by-step instructions in [docs/SUPABASE_SETUP_GUIDE.md](docs/SUPABASE_SETUP_GUIDE.md) to run the 4 migration scripts in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_setup.sql`
4. `supabase/migrations/004_seed_verified_verses.sql`

### 5. Running the Application
Run both backend and frontend with a single command:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing

Run automated tests for encryption, AI router fallback behavior, and Scripture verification:
```bash
npm test
```

---

## 📁 Project Structure

```
faith-creator-studio/
├── client/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, CanvasPreview, AIProviderCards
│   │   ├── pages/              # Login, Onboarding, Dashboard, Creators, Gallery
│   │   ├── services/           # Supabase & Backend API clients
│   │   └── hooks/              # Auth Context & Session handling
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── providers/          # OpenAIProvider, GeminiProvider, AIRouter
│   │   ├── security/           # AES-256-GCM encryption & key masking
│   │   ├── services/           # ImageCompositionService (Sharp), VerseService
│   │   ├── routes/             # aiSettings, generate, verses, projects, history
│   │   └── validators/         # Zod schemas
│   ├── tests/                  # Unit and integration test suites
│   └── package.json
├── supabase/
│   └── migrations/             # SQL schemas, RLS policies, Storage, Scripture seed
├── docs/                       # Complete setup documentation & guides
└── README.md
```

---

## 🔒 Security Highlights
- **No Client Secrets**: API keys are submitted directly to the server, validated with Zod, encrypted with AES-256-GCM, and stored in PostgreSQL with Row Level Security.
- **Frontend Masking**: Decrypted keys are never returned to client requests—only masked identifiers like `sk-proj...Kr4A` are surfaced.
- **Tenant Isolation**: Supabase RLS policies guarantee users can only query their own assets, projects, and settings.
>>>>>>> 38bb8a1 (Faith-and-Creator-Studio-production-release)
