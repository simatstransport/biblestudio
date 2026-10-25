import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { api } from '../services/api.js';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying your Google authentication...');

  useEffect(() => {
    async function handleAuth() {
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;

          if (data.session) {
            setStatus('Checking your AI Studio configuration...');
            const settings = await api.getAISettings();
            if (settings.configured) {
              navigate('/dashboard');
            } else {
              navigate('/onboarding');
            }
            return;
          }
        }

        // Fallback for direct redirect
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Auth callback error:', err.message);
        navigate('/login');
      }
    }

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center mx-auto mb-4 animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold font-cinzel text-white mb-2">Authenticating</h2>
        <p className="text-xs text-slate-300">{status}</p>
      </div>
    </div>
  );
};
