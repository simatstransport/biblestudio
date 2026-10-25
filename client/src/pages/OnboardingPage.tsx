import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { AnimatedLogo } from '../components/common/AnimatedLogo.js';
import { api } from '../services/api.js';
import { AISettings } from '../types/index.js';
import { AIProviderCards } from '../components/common/AIProviderCards.js';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = () => {
    api.getAISettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <AnimatedLogo size="lg" className="mb-3" />
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Faith & Creator Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-ivory-50 via-gold-400 to-amber-200">
            Set Up Your AI Studio
          </h1>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect your AI provider to start creating professional YouTube thumbnails and Bible verse posters.
            You can configure OpenAI, Google Gemini, or both with intelligent failover.
          </p>
        </div>

        {/* AI Provider Config Component */}
        <AIProviderCards
          settings={settings}
          onRefresh={fetchSettings}
          showRoutingControls={true}
        />

        {/* Bottom Navigation */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between p-6 bg-navy-900 border border-navy-700/80 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4 sm:mb-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Keys are encrypted with server-side AES-256-GCM and never exposed to the browser.</span>
          </div>

          <button
            onClick={handleFinish}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-sm shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
