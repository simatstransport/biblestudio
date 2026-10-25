import React, { useState } from 'react';
import { 
  Tv, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Download, 
  Palette, 
  CheckCircle2, 
  Wand2, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Eye,
  Check,
  Flame,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { api } from '../services/api.js';
import { TextOverlay } from '../types/index.js';

export const ThumbnailCreatorPage: React.FC = () => {
  // 1. User Input Form State (Content details only, no manual template picking)
  const [videoTitle, setVideoTitle] = useState('UNSTOPPABLE FAITH: Conquering the Storm');
  const [summary, setSummary] = useState('A powerful biblical message on overcoming extreme trials, stepping out of the boat, and experiencing God\'s miraculous breakthrough when all hope seems lost.');
  const [targetAudience, setTargetAudience] = useState('Young Believers, Seekers & Faith Creators');
  const [language, setLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [channelName, setChannelName] = useState('Faith Media');
  const [tone, setTone] = useState('High energy, urgent, dramatic and faith-filled');
  const [visualPreferences, setVisualPreferences] = useState('Dramatic raging ocean storm with a powerful beam of golden heavenly light breaking through the clouds');

  // 2. Generation State & Progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 3. AI Generated Result State
  const [result, setResult] = useState<{
    artworkUrl: string;
    finalDataUrl: string;
    creativeBrief: any;
    texts: TextOverlay[];
    aspectRatio: string;
    dimensions: { width: number; height: number };
  } | null>(null);

  // 4. Optional Post-Generation Editing (Re-renders text without re-generating image)
  const [showEditor, setShowEditor] = useState(false);
  const [editableTexts, setEditableTexts] = useState<TextOverlay[]>([]);
  const [isUpdatingText, setIsUpdatingText] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // 5-Stage Visual Progress Indicators
  const stages = [
    'Analyzing video topic & viral CTR psychology...',
    'Strategizing 16:9 composition & text-safe focal areas...',
    'Generating photorealistic 8K cinematic artwork with AI...',
    'Rendering bold 3D stroke typography & dynamic badge...',
    'Finalizing Ultra-HD 1280×720 YouTube thumbnail...'
  ];

  // Core AI Generation Action
  const handleGenerateAI = async () => {
    if (!videoTitle.trim() || !summary.trim()) {
      alert('Please provide both the video title and content summary.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);

      // Progressive stage simulation
      setGenerationStage(0);
      const stageTimer1 = setTimeout(() => setGenerationStage(1), 1800);
      const stageTimer2 = setTimeout(() => setGenerationStage(2), 3800);
      const stageTimer3 = setTimeout(() => setGenerationStage(3), 8500);

      const res = await api.generateThumbnailAI({
        videoTitle,
        summary,
        channelName,
        targetAudience,
        language,
        tone,
        visualPreferences,
        aspectRatio: '16:9'
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      setGenerationStage(4);

      if (res.success && res.finalDataUrl) {
        setResult({
          artworkUrl: res.artworkUrl,
          finalDataUrl: res.finalDataUrl,
          creativeBrief: res.creativeBrief,
          texts: res.texts,
          aspectRatio: '16:9',
          dimensions: res.dimensions || { width: 1280, height: 720 }
        });
        setEditableTexts(res.texts || []);
      } else {
        throw new Error('Image generation failed to return a final composite.');
      }
    } catch (err: any) {
      console.error('Thumbnail AI generation failed:', err);
      setGenerationError(err.message || 'AI generation failed. Please verify your configured API keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fine-Tuning: Re-render typography onto existing artwork
  const handleUpdateTextOverlay = async () => {
    if (!result || !result.artworkUrl) return;

    try {
      setIsUpdatingText(true);
      const res = await api.regenerateAIText({
        artworkUrl: result.artworkUrl,
        texts: editableTexts,
        aspectRatio: '16:9',
        type: 'youtube_thumbnail'
      });

      if (res.success && res.finalDataUrl) {
        setResult(prev => prev ? {
          ...prev,
          finalDataUrl: res.finalDataUrl,
          texts: editableTexts
        } : null);
      }
    } catch (err: any) {
      alert('Failed to update typography overlay: ' + err.message);
    } finally {
      setIsUpdatingText(false);
    }
  };

  // Download High-Res PNG
  const handleDownload = () => {
    if (!result?.finalDataUrl) return;
    const link = document.createElement('a');
    link.href = result.finalDataUrl;
    link.download = `YouTube-Thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save to Projects
  const handleSaveProject = async () => {
    if (!result) return;
    try {
      setIsSavingProject(true);
      await api.saveProject({
        title: videoTitle || 'YouTube Thumbnail',
        project_type: 'youtube_thumbnail',
        status: 'completed',
        input_data: {
          videoTitle,
          summary,
          channelName,
          targetAudience,
          language,
          tone,
          visualPreferences
        },
        design_preferences: {
          aspectRatio: '16:9',
          background: {
            type: 'image',
            value: result.artworkUrl
          },
          texts: editableTexts,
          images: []
        }
      });
      alert('Project saved successfully to your Projects library!');
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5" /> High-CTR AI Thumbnail Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            AI YouTube Thumbnail Studio
          </h1>
          <p className="mt-2 text-slate-400 max-w-3xl text-sm sm:text-base">
            Input your video topic and audience details. AI automatically invents a viral creative concept, paints custom 16:9 artwork, and renders bold high-contrast 3D stroke typography designed for maximum clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Clean Content Input Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-red-400" />
                Video & Content Brief
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                AI crafts the complete visual strategy, framing, and typography from your content.
              </p>
            </div>

            {/* Field 1: Video Title / Core Topic (Required) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Video Title or Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. UNSTOPPABLE FAITH: Conquering the Storm"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>

            {/* Field 2: Content Summary / Excerpt (Required) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Content Summary or Hook <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Provide a short synopsis or script excerpt. The AI uses this to find the emotional tension point."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none leading-relaxed"
              />
            </div>

            {/* Field 3: Target Audience & Language (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Youth, Seekers"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Language Mode
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="english">English (Latin)</option>
                  <option value="tamil">Tamil (தமிழ்)</option>
                  <option value="bilingual">Bilingual (English + Tamil)</option>
                </select>
              </div>
            </div>

            {/* Field 4: Channel Name (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Channel Name / Brand <span className="text-slate-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. Faith Media"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Field 5: Desired Emotional Tone (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Emotional Atmosphere & Tone <span className="text-slate-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="e.g. High energy, dramatic, urgent, wake-up call, intimate"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Field 6: Visual Preferences (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Visual Preferences <span className="text-slate-600 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={visualPreferences}
                onChange={(e) => setVisualPreferences(e.target.value)}
                placeholder="e.g. Cinematic storm, golden sunset, intense portrait lighting"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* PRIMARY CALL TO ACTION BUTTON */}
            <div className="pt-2">
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>AI Creating Thumbnail...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                    <span>Generate Thumbnail with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* REAL-TIME GENERATION PROGRESS INDICATOR */}
            {isGenerating && (
              <div className="bg-slate-950/80 border border-red-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-400 font-semibold flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Step {generationStage + 1} of 5
                  </span>
                  <span className="text-slate-500">Dual-Engine Pipeline</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-amber-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${((generationStage + 1) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 font-medium animate-pulse">
                  {stages[generationStage]}
                </p>
              </div>
            )}

            {/* Error Message */}
            {generationError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-200">AI Generation Error</p>
                  <p className="mt-0.5 text-slate-300">{generationError}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Output Preview & AI Rationale (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Canvas Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    High-CTR 16:9 Thumbnail Preview
                  </span>
                </div>
                {result && (
                  <span className="text-xs text-slate-500 font-mono">
                    {result.dimensions.width} × {result.dimensions.height} px
                  </span>
                )}
              </div>

              {/* Thumbnail Display Canvas */}
              <div className="relative aspect-video bg-black/60 flex items-center justify-center p-4">
                {result?.finalDataUrl ? (
                  <img
                    src={result.finalDataUrl}
                    alt="AI Generated YouTube Thumbnail"
                    className="max-h-[500px] w-auto max-w-full rounded-lg shadow-2xl object-contain border border-slate-800"
                  />
                ) : (
                  <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                      <Tv className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      Ready to Generate
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enter your video topic on the left and click "Generate Thumbnail with AI". The AI will synthesize a custom high-CTR image, compose 3D stroke typography, and display the completed thumbnail here.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              {result && (
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all duration-150"
                    >
                      <Download className="w-4 h-4" />
                      Download 1280×720
                    </button>

                    <button
                      onClick={handleSaveProject}
                      disabled={isSavingProject}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all duration-150 border border-slate-700"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingProject ? 'Saving...' : 'Save to Projects'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEditor(!showEditor)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Fine-Tune Text
                      {showEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleGenerateAI}
                      disabled={isGenerating}
                      className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                      title="Re-run AI pipeline for new visual variations"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI STRATEGY & CTR RATIONALE CARD */}
            {result?.creativeBrief && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      AI CTR Strategy & Creative Breakdown
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 font-mono">
                    2026 YouTube Standards
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">Headline Strategy</span>
                    <span className="text-amber-300 font-bold text-sm block mb-1">
                      {result.creativeBrief.headline || 'N/A'}
                    </span>
                    <p className="text-slate-400 text-xs">
                      {result.creativeBrief.ctrRationale || 'Optimized for high emotional tension and immediate scanning on mobile search feeds.'}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">Visual Focal Point</span>
                    <p className="text-slate-300 leading-relaxed">
                      {result.creativeBrief.visualSubject || 'Cinematic composition with high contrast rim lighting.'}
                    </p>
                  </div>
                </div>

                {result.creativeBrief.imagePrompt && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-xs">
                    <span className="text-slate-500 font-semibold uppercase block mb-1">AI Image Generation Prompt</span>
                    <p className="text-slate-400 italic line-clamp-3">
                      "{result.creativeBrief.imagePrompt}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* OPTIONAL FINE-TUNING DRAWER (Does not re-generate image, re-composites text instantly) */}
            {result && showEditor && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-bold text-white">Fine-Tune Typography</h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    Zero-credit instant update
                  </span>
                </div>

                <div className="space-y-4">
                  {editableTexts.map((txt, index) => (
                    <div key={txt.id || index} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 uppercase font-mono">
                          {txt.id === 'title' ? 'Main Headline' : txt.id === 'badge' ? 'Attention Badge' : txt.id === 'subtitle' ? 'Subtitle / Hook' : txt.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-slate-500">Color:</label>
                          <input
                            type="color"
                            value={txt.color || '#FFE600'}
                            onChange={(e) => {
                              const updated = [...editableTexts];
                              updated[index] = { ...updated[index], color: e.target.value };
                              setEditableTexts(updated);
                            }}
                            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                          />
                          {txt.stroke !== undefined && (
                            <>
                              <label className="text-[10px] text-slate-500">Stroke:</label>
                              <input
                                type="color"
                                value={txt.stroke || '#000000'}
                                onChange={(e) => {
                                  const updated = [...editableTexts];
                                  updated[index] = { ...updated[index], stroke: e.target.value };
                                  setEditableTexts(updated);
                                }}
                                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={txt.text}
                        onChange={(e) => {
                          const updated = [...editableTexts];
                          updated[index] = { ...updated[index], text: e.target.value };
                          setEditableTexts(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  ))}

                  <button
                    onClick={handleUpdateTextOverlay}
                    disabled={isUpdatingText}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    {isUpdatingText ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Re-compositing Typography...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        Apply Typography Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
