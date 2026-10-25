import React, { useState, useEffect } from 'react';
import { Settings, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar.js';
import { AIProviderCards } from '../components/common/AIProviderCards.js';
import { api } from '../services/api.js';
import { AISettings } from '../types/index.js';

export const AISettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AISettings | null>(null);

  const fetchSettings = () => {
    api.getAISettings().then(setSettings).catch(() => {});
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-gold-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-cinzel text-white">
              AI Provider Settings
            </h1>
          </div>
          <p className="text-sm text-slate-300">
            Manage your personal OpenAI and Google Gemini keys, select active AI models, and set intelligent failover priorities.
          </p>
        </div>

        {/* AI Provider Cards */}
        <AIProviderCards
          settings={settings}
          onRefresh={fetchSettings}
          showRoutingControls={true}
        />
      </main>
    </div>
  );
};
