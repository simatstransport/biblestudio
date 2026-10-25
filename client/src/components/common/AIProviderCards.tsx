import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Key,
  Sparkles,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api.js';
import { AISettings } from '../../types/index.js';

interface AIProviderCardsProps {
  settings: AISettings | null;
  onRefresh: () => void;
  showRoutingControls?: boolean;
}

export const AIProviderCards: React.FC<AIProviderCardsProps> = ({
  settings,
  onRefresh,
  showRoutingControls = true
}) => {
  // OpenAI Form State
  const [openaiKey, setOpenaiKey] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [openaiModel, setOpenaiModel] = useState(settings?.openai?.model || 'gpt-4o');
  const [openaiTesting, setOpenaiTesting] = useState(false);
  const [openaiTestResult, setOpenaiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [openaiHelpOpen, setOpenaiHelpOpen] = useState(false);
  const [openaiSaving, setOpenaiSaving] = useState(false);

  // Gemini Form State
  const [geminiKey, setGeminiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiModel, setGeminiModel] = useState(settings?.gemini?.model || 'gemini-flash-latest');
  const [geminiTesting, setGeminiTesting] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [geminiHelpOpen, setGeminiHelpOpen] = useState(false);
  const [geminiSaving, setGeminiSaving] = useState(false);

  // Router Priority
  const [primaryProvider, setPrimaryProvider] = useState<'openai' | 'gemini'>(settings?.primaryProvider || 'openai');
  const [fallbackProvider, setFallbackProvider] = useState<'openai' | 'gemini' | 'none'>(settings?.fallbackProvider || 'gemini');

  // Test OpenAI
  const handleTestOpenai = async () => {
    try {
      setOpenaiTesting(true);
      setOpenaiTestResult(null);
      const res = await api.testAIConnection('openai', openaiKey || undefined);
      setOpenaiTestResult(res);
    } catch (err: any) {
      setOpenaiTestResult({ success: false, message: err.message });
    } finally {
      setOpenaiTesting(false);
    }
  };

  // Save OpenAI
  const handleSaveOpenai = async () => {
    try {
      setOpenaiSaving(true);
      await api.saveAISettings({
        openaiApiKey: openaiKey || undefined,
        primaryProvider,
        fallbackProvider,
        openaiModel,
        geminiModel
      });
      setOpenaiKey('');
      setOpenaiTestResult({ success: true, message: 'OpenAI settings saved and encrypted!' });
      onRefresh();
    } catch (err: any) {
      setOpenaiTestResult({ success: false, message: err.message });
    } finally {
      setOpenaiSaving(false);
    }
  };

  // Test Gemini
  const handleTestGemini = async () => {
    try {
      setGeminiTesting(true);
      setGeminiTestResult(null);
      const res = await api.testAIConnection('gemini', geminiKey || undefined);
      setGeminiTestResult(res);
    } catch (err: any) {
      setGeminiTestResult({ success: false, message: err.message });
    } finally {
      setGeminiTesting(false);
    }
  };

  // Save Gemini
  const handleSaveGemini = async () => {
    try {
      setGeminiSaving(true);
      await api.saveAISettings({
        geminiApiKey: geminiKey || undefined,
        primaryProvider,
        fallbackProvider,
        openaiModel,
        geminiModel
      });
      setGeminiKey('');
      setGeminiTestResult({ success: true, message: 'Gemini settings saved and encrypted!' });
      onRefresh();
    } catch (err: any) {
      setGeminiTestResult({ success: false, message: err.message });
    } finally {
      setGeminiSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Provider Routing Priority Selector */}
      {showRoutingControls && (
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">AI Provider Routing Priority</h3>
              <p className="text-xs text-slate-300">
                Choose which engine powers your thumbnail copywriting and devotional creations first.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Provider</label>
              <select
                value={primaryProvider}
                onChange={(e) => {
                  const val = e.target.value as 'openai' | 'gemini';
                  setPrimaryProvider(val);
                  if (fallbackProvider === val) {
                    setFallbackProvider(val === 'openai' ? 'gemini' : 'openai');
                  }
                }}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              >
                <option value="openai">OpenAI (Recommended Default)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Fallback Provider (On Quota / Server Errors)</label>
              <select
                value={fallbackProvider}
                onChange={(e) => setFallbackProvider(e.target.value as any)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              >
                <option value={primaryProvider === 'openai' ? 'gemini' : 'openai'}>
                  {primaryProvider === 'openai' ? 'Google Gemini' : 'OpenAI'} (Automatic Failover)
                </option>
                <option value="none">None (Fail immediately without fallback)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Two Provider Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================= */}
        {/* PROVIDER A: OPENAI */}
        {/* ========================================================= */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  OA
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Provider A: OpenAI API</h3>
                  <p className="text-xs text-slate-400">Powers GPT-4o, GPT-4o-mini & DALL-E 3</p>
                </div>
              </div>

              {settings?.openai?.configured ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Not Connected
                </span>
              )}
            </div>

            {/* Currently Saved Key Display */}
            {settings?.openai?.maskedKey && (
              <div className="mt-4 p-3 rounded-xl bg-navy-950/70 border border-navy-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Active Key:</span>
                  <code className="text-gold-400 font-mono">{settings.openai.maskedKey}</code>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {settings?.openai?.configured ? 'Update OpenAI API Key' : 'Enter OpenAI API Key'}
                </label>
                <div className="relative">
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Selection</label>
                <select
                  value={openaiModel}
                  onChange={(e) => setOpenaiModel(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="gpt-4o">gpt-4o (Most Intelligent & Creative)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost Efficient)</option>
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                </select>
              </div>

              {/* Status/Error Alert */}
              {openaiTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                    openaiTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {openaiTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <span>{openaiTestResult.message}</span>
                </div>
              )}

              {/* Expandable Help Section */}
              <div className="border border-navy-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenaiHelpOpen(!openaiHelpOpen)}
                  className="w-full flex items-center justify-between p-3 bg-navy-950/50 hover:bg-navy-950 text-xs font-medium text-slate-300 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <span>📖 How to get an OpenAI API key</span>
                  </span>
                  {openaiHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {openaiHelpOpen && (
                  <div className="p-4 bg-navy-950 text-xs text-slate-300 space-y-2 border-t border-navy-800 leading-relaxed">
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                      <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-gold-400 underline inline-flex items-center">platform.openai.com/api-keys <ExternalLink className="w-3 h-3 ml-0.5"/></a></li>
                      <li>Sign in to your OpenAI account.</li>
                      <li>Click "Create new secret key".</li>
                      <li>Copy the generated key.</li>
                      <li>Paste it into the box above.</li>
                      <li>Click "Test Connection" and "Save Key".</li>
                    </ol>
                    <p className="text-[11px] text-slate-400 pt-2 border-t border-navy-800">
                      ℹ️ Note: API access, model availability, and billing depend on your personal OpenAI developer account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestOpenai}
              disabled={openaiTesting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {openaiTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSaveOpenai}
              disabled={openaiSaving || (!openaiKey && !settings?.openai?.configured)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold shadow-md shadow-gold-500/20 disabled:opacity-50 cursor-pointer"
            >
              {openaiSaving ? 'Saving...' : 'Save OpenAI Key'}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PROVIDER B: GOOGLE GEMINI */}
        {/* ========================================================= */}
        <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
                  GG
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Provider B: Google Gemini API</h3>
                  <p className="text-xs text-slate-400">Powers Gemini 1.5 Flash & Gemini 1.5 Pro</p>
                </div>
              </div>

              {settings?.gemini?.configured ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Not Connected
                </span>
              )}
            </div>

            {/* Currently Saved Key Display */}
            {settings?.gemini?.maskedKey && (
              <div className="mt-4 p-3 rounded-xl bg-navy-950/70 border border-navy-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300">Active Key:</span>
                  <code className="text-gold-400 font-mono">{settings.gemini.maskedKey}</code>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {settings?.gemini?.configured ? 'Update Gemini API Key' : 'Enter Gemini API Key'}
                </label>
                <div className="relative">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy... or AQ.Ab..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Model Selection</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="gemini-flash-latest">gemini-flash-latest (Lightning Fast & Generous Free Tier)</option>
                  <option value="gemini-pro-latest">gemini-1.5-pro (Deep Reasoning & Multimodal)</option>
                  <option value="gemini-2.5-flash-lite">gemini-2.0-flash-exp</option>
                </select>
              </div>

              {/* Status/Error Alert */}
              {geminiTestResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                    geminiTestResult.success
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {geminiTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  )}
                  <span>{geminiTestResult.message}</span>
                </div>
              )}

              {/* Expandable Help Section */}
              <div className="border border-navy-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGeminiHelpOpen(!geminiHelpOpen)}
                  className="w-full flex items-center justify-between p-3 bg-navy-950/50 hover:bg-navy-950 text-xs font-medium text-slate-300 transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <span>📖 How to get a Gemini API key</span>
                  </span>
                  {geminiHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {geminiHelpOpen && (
                  <div className="p-4 bg-navy-950 text-xs text-slate-300 space-y-2 border-t border-navy-800 leading-relaxed">
                    <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                      <li>Visit <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-gold-400 underline inline-flex items-center">aistudio.google.com <ExternalLink className="w-3 h-3 ml-0.5"/></a></li>
                      <li>Sign in to the Google account used for Gemini API access.</li>
                      <li>Click "Get API key".</li>
                      <li>Create an API key in a new or existing Google Cloud project.</li>
                      <li>Copy the key and paste it into the box above.</li>
                      <li>Click "Test Connection" and "Save Key".</li>
                    </ol>
                    <p className="text-[11px] text-slate-400 pt-2 border-t border-navy-800">
                      ⚠️ Note: Signing in with Google does not automatically grant Gemini API access. API keys and quotas are provisioned in Google AI Studio.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-navy-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestGemini}
              disabled={geminiTesting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {geminiTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSaveGemini}
              disabled={geminiSaving || (!geminiKey && !settings?.gemini?.configured)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold shadow-md shadow-gold-500/20 disabled:opacity-50 cursor-pointer"
            >
              {geminiSaving ? 'Saving...' : 'Save Gemini Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
