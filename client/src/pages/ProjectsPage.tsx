import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Star, Trash2, Copy, Tv, BookOpen, Search, Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { api } from '../services/api.js';
import { ProjectData } from '../types/index.js';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filter, setFilter] = useState<'all' | 'youtube_thumbnail' | 'bible_poster' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    api.getProjects()
      .then(res => setProjects(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  const handleToggleFavorite = async (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.saveProject({
        id: project.id,
        is_favorite: !project.is_favorite
      });
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_favorite: !p.is_favorite } : p));
    } catch (err: any) {
      alert('Failed to update favorite: ' + err.message);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'youtube_thumbnail' && p.project_type !== 'youtube_thumbnail') return false;
    if (filter === 'bible_poster' && p.project_type !== 'bible_poster') return false;
    if (filter === 'favorites' && !p.is_favorite) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white flex items-center space-x-2">
              <FolderKanban className="w-7 h-7 text-gold-400" />
              <span>Project Studio Gallery</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse, reopen, duplicate, or export your saved thumbnails and Bible posters.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/create/thumbnail"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white flex items-center space-x-1.5 shadow-md shadow-red-600/20"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>New Thumbnail</span>
            </Link>
            <Link
              to="/create/verse"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 text-navy-950 font-bold flex items-center space-x-1.5 shadow-md shadow-gold-500/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>New Poster</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'all', label: `All (${projects.length})` },
              { id: 'youtube_thumbnail', label: 'YouTube Thumbnails' },
              { id: 'bible_poster', label: 'Bible Posters' },
              { id: 'favorites', label: 'Starred' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === tab.id
                    ? 'bg-gold-500/15 border border-gold-500/40 text-gold-400 font-bold'
                    : 'bg-navy-900 border border-navy-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search designs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-navy-900/60 border border-navy-800 rounded-2xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-gold-400/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No projects found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filter or start a new design in the studio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((p) => {
              const isThumbnail = p.project_type === 'youtube_thumbnail';
              return (
                <div
                  key={p.id}
                  className="bg-navy-900 border border-navy-800 rounded-2xl p-5 hover:border-gold-500/40 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isThumbnail ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                      }`}>
                        {isThumbnail ? 'YouTube Thumbnail' : 'Bible Verse Poster'}
                      </span>
                      <button
                        onClick={(e) => handleToggleFavorite(p, e)}
                        className={`p-1 rounded hover:bg-navy-800 transition-colors ${
                          p.is_favorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${p.is_favorite ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-bold text-white text-base mb-1 line-clamp-1">{p.title}</h3>
                    <p className="text-[11px] text-slate-400">
                      Created: {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between">
                    <Link
                      to={isThumbnail ? '/create/thumbnail' : '/create/verse'}
                      className="text-xs font-semibold text-gold-400 hover:text-gold-300"
                    >
                      Open in Studio →
                    </Link>

                    <button
                      onClick={(e) => handleDelete(p.id!, e)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
