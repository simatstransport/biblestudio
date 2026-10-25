import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Tv, 
  BookOpen, 
  FolderKanban, 
  History, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { AnimatedLogo } from '../common/AnimatedLogo.js';
import { useAuth } from '../../hooks/useAuth.js';
import { api } from '../../services/api.js';
import { AISettings } from '../../types/index.js';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getAISettings()
        .then(setAiSettings)
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Sparkles },
    { name: 'YouTube Thumbnails', path: '/create/thumbnail', icon: Tv },
    { name: 'Bible Posters', path: '/create/verse', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'History', path: '/history', icon: History },
  ];

  if (!user) return null;

  return (
    <nav className="border-b border-navy-800 bg-navy-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <AnimatedLogo size="sm" />
            <div>
              <span className="text-lg font-bold font-cinzel tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-ivory-50 via-gold-400 to-amber-200">
                Faith & Creator Studio
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 uppercase tracking-widest">
                AI Media & Devotional Design
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-navy-800 text-gold-400 border border-gold-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Status Badges & Profile */}
          <div className="flex items-center space-x-3">
            {/* AI Status Badge */}
            <Link
              to="/settings/ai"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-navy-700 bg-navy-900/80 hover:border-gold-500/40 transition-colors"
              title="Click to configure AI providers"
            >
              <Cpu className="w-3.5 h-3.5 text-gold-400" />
              {aiSettings?.openai?.configured ? (
                <span className="text-emerald-400 font-semibold">OpenAI Active</span>
              ) : aiSettings?.gemini?.configured ? (
                <span className="text-sky-400 font-semibold">Gemini Active</span>
              ) : (
                <span className="text-amber-400 font-semibold animate-pulse">Setup AI Keys</span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-navy-900 border border-transparent hover:border-navy-700 transition-colors focus:outline-none"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-gold-500/30 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-navy-800 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium text-slate-200">
                  {user.displayName}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-navy-900 border border-navy-700 shadow-xl py-1 z-50 text-sm"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-navy-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="font-medium text-white truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings/ai"
                    className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:bg-navy-800 hover:text-white"
                  >
                    <Settings className="w-4 h-4" />
                    <span>AI Provider Settings</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
