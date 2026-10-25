import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tv, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Clock, 
  Cpu, 
  Plus, 
  FolderKanban,
  Download,
  Share2
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
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-navy-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-gold-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-2xl border-2 border-gold-500/40 object-cover shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center text-navy-950 font-bold text-2xl shadow-lg">
                  {user?.displayName?.charAt(0).toUpperCase() || 'F'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white">
                    Welcome to Your Creative Studio, {user?.displayName}!
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Ready to craft viral YouTube thumbnails and spiritually inspiring Scripture posters.
                </p>
              </div>
            </div>

            {/* AI Engine Status Pill */}
            <div className="flex items-center space-x-2 bg-navy-950/80 border border-navy-700 px-4 py-2 rounded-2xl">
              <Cpu className="w-4 h-4 text-gold-400" />
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-navy-700/60 text-center sm:text-left">
            <div>
              <p className="text-xs text-slate-400">Total Designs Created</p>
              <p className="text-xl sm:text-2xl font-bold font-cinzel text-gold-400">{totalDesigns}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Starred Favorites</p>
              <p className="text-xl sm:text-2xl font-bold font-cinzel text-amber-300">{favoriteCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">OpenAI Engine</p>
              <p className="text-sm font-semibold text-emerald-400">
                {settings?.openai?.configured ? 'Connected' : 'Not Configured'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Gemini Engine</p>
              <p className="text-sm font-semibold text-sky-400">
                {settings?.gemini?.configured ? 'Connected' : 'Not Configured'}
              </p>
            </div>
          </div>
        </div>

        {/* TWO LARGE CREATIVE TOOLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TOOL A: CREATE YOUTUBE THUMBNAIL */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-indigo-950/50 border border-navy-700/80 p-8 shadow-2xl hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 mb-6 group-hover:scale-110 transition-transform">
                <Tv className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2 block">
                High-CTR Video Marketing
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Create YouTube Thumbnail
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Generate professional, high-impact thumbnails for YouTube videos, events, announcements, sermons, and promotional content with deterministic typography and subject compositing.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>Logo & Multiple Subject uploads with clean cutout framing</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>AI Title hook generator & 16:9 safe-area preview</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>Optional Event Venue, Date & Contact badges</span>
                </div>
              </div>
            </div>

            <Link
              to="/create/thumbnail"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-red-600/20 transition-all group-hover:translate-x-1"
            >
              <span>Create YouTube Thumbnail</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* TOOL B: CREATE BIBLE VERSE POSTER */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-gold-950/40 border border-navy-700/80 p-8 shadow-2xl hover:border-gold-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl group-hover:bg-gold-500/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-200 flex items-center justify-center text-navy-950 shadow-lg shadow-gold-500/30 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2 block">
                Devotional & Ministry Media
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white mb-3">
                Create Bible Verse Poster
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Create beautiful Bible verse posters in English, Tamil, or both languages together with verified canonical scripture, spiritual backgrounds, and AI devotional reflections.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span>Verified English (KJV) & Tamil canonical Scripture library</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span>Option A (English), Option B (Tamil), Option C (Bilingual)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  <span>1080×1350 (4:5), 1080×1080 (1:1), 1080×1920 (9:16) export</span>
                </div>
              </div>
            </div>

            <Link
              to="/create/verse"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-300 hover:from-gold-400 hover:to-amber-200 text-navy-950 font-bold text-sm shadow-xl shadow-gold-500/20 transition-all group-hover:translate-x-1"
            >
              <span>Create Bible Verse Poster</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-bold font-cinzel text-white">Recent Projects</h2>
            </div>
            <Link to="/projects" className="text-xs text-gold-400 hover:underline">
              View All Projects ({totalDesigns}) →
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-10 text-center">
              <Sparkles className="w-10 h-10 text-gold-400/50 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No projects created yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Get started by clicking either "Create YouTube Thumbnail" or "Create Bible Verse Poster" above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="bg-navy-900 border border-navy-800 rounded-2xl p-5 hover:border-gold-500/40 transition-colors shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-navy-800 text-gold-400">
                        {p.project_type === 'youtube_thumbnail' ? 'YouTube Thumbnail' : 'Bible Poster'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base line-clamp-1">{p.title}</h4>
                  </div>

                  <div className="mt-4 pt-4 border-t border-navy-800 flex items-center justify-between">
                    <Link
                      to={p.project_type === 'youtube_thumbnail' ? '/create/thumbnail' : '/create/verse'}
                      className="text-xs font-semibold text-gold-400 hover:text-gold-300"
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
