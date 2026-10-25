import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, KeyRound, ArrowRight, BookOpen, Tv, CheckCircle2 } from 'lucide-react';
import { AnimatedLogo } from '../components/common/AnimatedLogo.js';
import { useAuth } from '../hooks/useAuth.js';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loginAsDemoUser, isSupabaseConnected } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errCode = params.get('error_code');
    const errDesc = params.get('error_description') || params.get('error');
    if (errCode === 'bad_oauth_state' || (errDesc && errDesc.includes('OAuth state'))) {
      setError("OAuth State Expired/Not Found. Please add 'http://localhost:3000/**' to your Supabase Redirect URLs in Supabase Dashboard (Auth -> URL Configuration), or use Instant Evaluation Mode below.");
    } else if (errDesc) {
      setError(errDesc);
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be initiated.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemoUser();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-gold-500/10 via-navy-900/40 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Animated App Logo with Shimmer and Divine Glow */}
        <AnimatedLogo size="xl" withText={true} withTagline={true} />

        {/* Subtitle */}
        <p className="mt-3 text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
          The premier AI creative suite for high-impact YouTube thumbnails and verified bilingual Bible verse posters.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-navy-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-navy-700/80 backdrop-blur-xl relative">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-900/40 border border-red-500/50 text-red-200 text-xs">
              {error}
            </div>
          )}

          {/* Primary Action: Continue with Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-slate-700 bg-white hover:bg-slate-100 text-slate-800 font-semibold shadow-md transition-all group hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Instant Sandbox Evaluation Toggle */}
          <div className="mt-4 pt-4 border-t border-navy-800 text-center">
            <button
              onClick={handleDemoLogin}
              className="text-xs text-gold-400 hover:text-gold-300 font-medium underline cursor-pointer"
            >
              🚀 Launch Studio in Instant Evaluation Mode
            </button>
          </div>

          {/* Key Value Highlights */}
          <div className="mt-6 pt-6 border-t border-navy-800 space-y-3">
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>OpenAI-First + Gemini-Fallback:</strong> Never hit quota dead-ends during live ministry campaigns.</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span><strong>Tamil & English Script Support:</strong> Verified canonical scripture in both languages with crisp typography.</span>
            </div>
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span><strong>Bring Your Own Key (BYOK):</strong> Client-side masking and server AES-256-GCM zero-leak encryption.</span>
            </div>
          </div>
        </div>

        {/* Security / Privacy Banner */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-gold-500" />
          <span>Secured with Supabase Authentication & PostgreSQL RLS</span>
        </div>
      </div>
    </div>
  );
};
