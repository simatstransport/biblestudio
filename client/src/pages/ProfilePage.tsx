import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { useAuth } from '../hooks/useAuth.js';

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-navy-900 border border-navy-700/80 rounded-3xl p-8 shadow-2xl space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-5 pb-6 border-b border-navy-800">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-20 h-20 rounded-2xl border-2 border-gold-500/40 object-cover shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center text-navy-950 font-bold text-3xl shadow-xl">
                {user?.displayName?.charAt(0).toUpperCase() || 'F'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold font-cinzel text-white">{user?.displayName}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Google OAuth Session Active</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold-400">
              Account Credentials & Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-[11px] text-slate-400 block mb-1">User Identification (UUID)</span>
                <code className="text-xs text-slate-300 font-mono select-all truncate block">
                  {user?.id}
                </code>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-[11px] text-slate-400 block mb-1">Authentication Provider</span>
                <span className="text-xs text-white font-medium flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Google via Supabase Auth</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-6 border-t border-navy-800 flex justify-end">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Studio</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
