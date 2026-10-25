import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tv, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Cpu, 
  FolderKanban,
  Flame,
  Wand2,
  Instagram,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../services/api.js';
import { AISettings, ProjectData } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAISettings().catch(() => null),
      api.getProjects().catch(() => ({ data: [] }))
    ]).then(([aiData, projData]) => {
      if (aiData) setSettings(aiData);
      if (projData?.data) setProjects(projData.data);
      setLoading(false);
    });
  }, []);

  const totalDesigns = projects.length;
  const favoriteCount = projects.filter(p => p.is_favorite).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-2xl border-2 border-amber-400/40 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg">
                  {user?.displayName?.charAt(0).toUpperCase() || 'F'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Faith & Creator Studio
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                    AI 2.0
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Fully automated, AI-powered Christian content generator. Supply your content details — AI creates the art, layout & typography.
                </p>
              </div>
            </div>

            {/* AI Engine Status Pill */}
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-700 px-4 py-2 rounded-2xl">
              <Cpu className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <span className="text-slate-400">Router: </span>
                <span className="font-semibold text-emerald-400 uppercase">
                  {settings?.primaryProvider || 'OpenAI'} Primary
                </span>
                <span className="text-slate-500"> → </span>
                <span className="text-slate-400">
                  {settings?.fallbackProvider === 'none' ? 'No Fallback' : `${settings?.fallbackProvider || 'Gemini'} Fallback`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60 text-center sm:text-left">
            <div>
              <p className="text-xs text-slate-400">Total Designs Created</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400">{totalDesigns}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Connected Instagram</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-semibold text-slate-200">@creationbibleverse</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400">AI Image Engine</p>
              <p className="text-sm font-semibold text-emerald-400">
                DALL-E 3 & Imagen 3
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Language Support</p>
              <p className="text-sm font-semibold text-sky-400">
                English & Tamil Unicode
              </p>
            </div>
          </div>
        </div>

        {/* TWO PRIMARY CREATIVE ENGINES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ENGINE 1: BIBLE VERSE POSTER */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 border border-slate-700/80 p-8 shadow-2xl hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-200 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">
                Devotional Scripture Art
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                AI Bible Verse Poster
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Input your Bible reference and theme. AI synthesizes a cinematic visual concept (Jesus comforting, holy temple, peaceful waters), paints 8K artwork, and overlays exact scripture with dynamic contrast scrims.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Exact Scripture Preservation (English & Tamil Unicode)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dynamic Chiaroscuro Scrim for 100% Text Readability</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>1-Click Post to @creationbibleverse Instagram Feed</span>
                </div>
              </div>
            </div>

            <Link
              to="/create/verse"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all group-hover:translate-x-1"
            >
              <span>Generate Bible Poster with AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ENGINE 2: YOUTUBE THUMBNAIL */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-red-950/40 border border-slate-700/80 p-8 shadow-2xl hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 mb-6 group-hover:scale-110 transition-transform">
                <Tv className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">
                Viral High-CTR Thumbnails
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                AI YouTube Thumbnail
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Input your video title and topic. AI formulates a high-CTR emotional tension hook, paints a dramatic 16:9 widescreen scene, and overlays bold 3D stroke typography designed to stand out on mobile feeds.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>AI Punchy Headline & Viral CTR Psychology Rationale</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>3D Outline Typography with Zero-Credit Fine Tuning</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Ultra-HD 1280×720 Widescreen PNG Output</span>
                </div>
              </div>
            </div>

            <Link
              to="/create/thumbnail"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-red-600/20 transition-all group-hover:translate-x-1"
            >
              <span>Generate Thumbnail with AI</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Recent Projects & Creations</h2>
            </div>
            <Link to="/projects" className="text-xs text-amber-400 hover:underline">
              View All Projects ({totalDesigns}) →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
              <Sparkles className="w-10 h-10 text-amber-400/50 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No creations yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Get started by generating your first AI Bible Verse Poster or AI YouTube Thumbnail above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-400/40 transition-colors shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                        {p.project_type === 'youtube_thumbnail' ? 'YouTube Thumbnail' : 'Bible Poster'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base line-clamp-1">{p.title}</h4>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={p.project_type === 'youtube_thumbnail' ? '/create/thumbnail' : '/create/verse'}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Open in Studio →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
