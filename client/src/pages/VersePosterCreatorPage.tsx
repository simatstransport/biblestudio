import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Download, 
  Share2, 
  Layers, 
  Palette, 
  CheckCircle2, 
  Search, 
  Wand2, 
  Instagram, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Eye,
  Check,
  HeartHandshake
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { api } from '../services/api.js';
import { TextOverlay } from '../types/index.js';

export const VersePosterCreatorPage: React.FC = () => {
  // 1. User Input Form State
  const [verseReference, setVerseReference] = useState('1 Kings 8:15');
  const [verseText, setVerseText] = useState('Blessed be the LORD God of Israel, which spake with his mouth unto David my father, and hath with his hand fulfilled it, saying,');
  const [language, setLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [purposeOrTheme, setPurposeOrTheme] = useState("God's faithfulness, intimate comfort, and divine fulfillment");
  const [translation, setTranslation] = useState('King James Version (KJV)');
  const [atmosphere, setAtmosphere] = useState('Warm, peaceful, intimate divine presence, golden hour glow');
  const [visualPreferences, setVisualPreferences] = useState('Jesus embracing a young believer tenderly with golden backlight');
  const [additionalCaption, setAdditionalCaption] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | '9:16'>('4:5');

  // 2. Generation State
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

  // 4. Optional Post-Generation Editing
  const [showEditor, setShowEditor] = useState(false);
  const [editableTexts, setEditableTexts] = useState<TextOverlay[]>([]);
  const [isUpdatingText, setIsUpdatingText] = useState(false);

  // 5. Manual Instagram Publish Trigger
  const [isPublishingIg, setIsPublishingIg] = useState(false);
  const [igSuccessMessage, setIgSuccessMessage] = useState<string | null>(null);
  const [isSearchingVerse, setIsSearchingVerse] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Generation Stages Display
  const stages = [
    'Analyzing scripture & theological themes...',
    'Determining visual composition & text-safe area...',
    'Generating custom cinematic artwork with AI...',
    'Rendering verified scripture typography & contrast scrim...',
    'Finalizing Ultra-HD design...'
  ];

  // Auto-Fetch Verse from Database / API
  const handleLookupVerse = async () => {
    if (!verseReference.trim()) return;
    try {
      setIsSearchingVerse(true);
      const res = await api.searchVerse(verseReference);
      if (res.data) {
        setVerseReference(res.data.reference);
        if (language === 'tamil') {
          setVerseText(res.data.tamil.text);
        } else if (language === 'bilingual') {
          setVerseText(`${res.data.english.text}\n\n${res.data.tamil.text}`);
        } else {
          setVerseText(res.data.english.text);
        }
      } else {
        alert('Could not find canonical verse matching that reference. You can type or paste the exact verse text below.');
      }
    } catch {
      alert('Could not find canonical verse matching that reference. You can type or paste the exact verse text below.');
    } finally {
      setIsSearchingVerse(false);
    }
  };

  // Main Core AI Generation Action
  const handleGenerateAI = async () => {
    if (!verseReference.trim() || !verseText.trim()) {
      alert('Please provide both the Bible verse reference and the scripture text.');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationError(null);
      setIgSuccessMessage(null);

      // Simulate step progress for user feedback while backend executes
      setGenerationStage(0);
      const stageTimer1 = setTimeout(() => setGenerationStage(1), 1800);
      const stageTimer2 = setTimeout(() => setGenerationStage(2), 3800);
      const stageTimer3 = setTimeout(() => setGenerationStage(3), 8500);

      const res = await api.generatePosterAI({
        verseReference,
        verseText,
        language,
        purposeOrTheme,
        translation,
        atmosphere,
        visualPreferences,
        additionalCaption,
        aspectRatio
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
          aspectRatio: res.aspectRatio || aspectRatio,
          dimensions: res.dimensions
        });
        setEditableTexts(res.texts);
      } else {
        throw new Error('AI generation returned an incomplete response.');
      }
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setGenerationError(err.message || 'An error occurred during AI generation. Please verify your API key in Settings.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Optional Fine-Tuning: Re-render Typography on Artwork
  const handleUpdateText = async () => {
    if (!result) return;
    try {
      setIsUpdatingText(true);
      const res = await api.regenerateAIText({
        artworkUrl: result.artworkUrl,
        texts: editableTexts,
        aspectRatio: result.aspectRatio as any,
        type: 'bible_poster',
        scrimType: result.creativeBrief?.textArea === 'right_side' ? 'right' : 'top'
      });

      if (res.success && res.finalDataUrl) {
        setResult(prev => prev ? {
          ...prev,
          finalDataUrl: res.finalDataUrl,
          texts: editableTexts
        } : null);
      }
    } catch (err: any) {
      alert('Failed to update typography: ' + err.message);
    } finally {
      setIsUpdatingText(false);
    }
  };

  // Manual Instagram Post Trigger
  const handlePublishToInstagram = async () => {
    if (!result) return;
    try {
      setIsPublishingIg(true);
      setIgSuccessMessage(null);

      const captionText = result.creativeBrief?.devotionalCaption 
        ? `${verseReference}\n\n"${verseText}"\n\n${result.creativeBrief.devotionalCaption}\n\n${(result.creativeBrief.hashtags || ['#BibleVerse', '#DailyScripture', '#Faith']).join(' ')}`
        : `✝ ${verseReference}\n\n"${verseText}"\n\nMay this Scripture bless your day and renew your strength in Christ. 🙏✨\n\n#BibleVerse #DailyScripture #FaithInGod #ScriptureOfTheDay`;

      const res = await api.publishToInstagramManual(result.finalDataUrl, captionText);

      if (res.success) {
        setIgSuccessMessage(`Successfully published to Instagram! Media ID: ${res.mediaId || 'Active'}`);
      }
    } catch (err: any) {
      alert('Instagram publishing notice: ' + err.message);
    } finally {
      setIsPublishingIg(false);
    }
  };

  // Download High-Res PNG
  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.finalDataUrl;
    link.download = `bible-poster-${verseReference.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
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
        title: `AI Poster: ${verseReference}`,
        project_type: 'bible_poster',
        status: 'completed',
        input_data: {
          verseReference,
          verseText,
          language,
          purposeOrTheme,
          translation,
          atmosphere,
          visualPreferences,
          creativeBrief: result.creativeBrief
        },
        design_preferences: {
          aspectRatio: result.aspectRatio as any,
          background: {
            type: 'image',
            value: result.artworkUrl
          },
          texts: result.texts,
          images: []
        }
      });
      alert('Design successfully saved to your Projects!');
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSavingProject(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gold-600/10 border border-gold-500/30 text-gold-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-cinzel text-white">AI Bible Poster Generator</h1>
              <p className="text-xs text-slate-400">
                Provide your scripture content details — AI creates the complete visual concept, artwork, and typography automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Content Details Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Scripture Details</span>
                </span>
                <span className="text-[11px] text-slate-400">Required</span>
              </div>

              {/* Bible Verse Reference & Quick Lookup */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Bible Reference <span className="text-red-400">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={verseReference}
                    onChange={(e) => setVerseReference(e.target.value)}
                    placeholder="e.g. 1 Kings 8:15, John 3:16, Psalm 23:1"
                    className="flex-1 bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500 font-semibold"
                  />
                  <button
                    onClick={handleLookupVerse}
                    disabled={isSearchingVerse}
                    className="px-3 py-2 rounded-xl bg-navy-800 hover:bg-gold-500/20 text-gold-400 border border-navy-700 hover:border-gold-500 text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingVerse ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Lookup</span>
                  </button>
                </div>
              </div>

              {/* Bible Verse Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Scripture Verse Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={verseText}
                  onChange={(e) => setVerseText(e.target.value)}
                  placeholder="Paste or enter the exact scripture verse text..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-gold-500 leading-relaxed font-serif"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Your exact words and spellings are 100% preserved and rendered deterministically.
                </p>
              </div>

              {/* Language Mode */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'english', label: 'English' },
                  { id: 'tamil', label: 'Tamil' },
                  { id: 'bilingual', label: 'Bilingual' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLanguage(l.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                      language === l.id
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40'
                        : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Devotional Purpose or Theme */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Devotional Purpose or Theme <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={purposeOrTheme}
                  onChange={(e) => setPurposeOrTheme(e.target.value)}
                  placeholder="e.g. Daily encouragement, Thanksgiving sermon, Intimate comfort"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Poster Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '4:5', label: '4:5 Portrait' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '9:16', label: '9:16 Story / Reel' },
                  ].map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id as any)}
                      className={`py-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        aspectRatio === ar.id
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                          : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Nuances (Collapsible) */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block pb-1 border-b border-navy-800">
                Optional Creative Nuances
              </span>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Desired Emotional Atmosphere (Optional)</label>
                  <input
                    type="text"
                    value={atmosphere}
                    onChange={(e) => setAtmosphere(e.target.value)}
                    placeholder="e.g. Warm golden hour, comforting, solemn, celestial majesty"
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Visual Concept Preferences (Optional)</label>
                  <input
                    type="text"
                    value={visualPreferences}
                    onChange={(e) => setVisualPreferences(e.target.value)}
                    placeholder="e.g. Jesus embracing believer, temple pillars, open Bible with heavenly rays"
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500 text-navy-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-gold-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                  <span>Creating with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-navy-950" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>

            {/* Generation Progress Indicator */}
            {isGenerating && (
              <div className="p-4 bg-navy-900 border border-gold-500/40 rounded-2xl space-y-3 animate-pulse">
                <div className="flex items-center justify-between text-xs font-semibold text-gold-400">
                  <span>AI Creative Pipeline Active</span>
                  <span>Stage {generationStage + 1} of 5</span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gold-500 to-amber-400 h-full transition-all duration-500"
                    style={{ width: `${((generationStage + 1) / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 italic">
                  {stages[generationStage]}
                </p>
              </div>
            )}

            {/* Error Message */}
            {generationError && (
              <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-start space-x-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Generation Failed:</span>
                  <p>{generationError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: AI Output & Live Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-6">
            {result ? (
              <div className="w-full space-y-5">
                {/* Image Preview Box */}
                <div className="w-full bg-navy-900 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-navy-700 max-h-[640px]">
                    <img 
                      src={result.finalDataUrl} 
                      alt="AI Generated Bible Poster" 
                      className="w-full h-auto object-contain max-h-[600px] rounded-lg"
                    />
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                    <button
                      onClick={handleDownload}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>

                    <button
                      onClick={handlePublishToInstagram}
                      disabled={isPublishingIg}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isPublishingIg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Instagram className="w-3.5 h-3.5" />}
                      <span>Post to Instagram</span>
                    </button>

                    <button
                      onClick={handleGenerateAI}
                      className="py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-gold-400" />
                      <span>New Concept</span>
                    </button>

                    <button
                      onClick={handleSaveProject}
                      disabled={isSavingProject}
                      className="py-2.5 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-gold-400" />
                      <span>{isSavingProject ? 'Saving...' : 'Save Project'}</span>
                    </button>
                  </div>

                  {/* Instagram Success Alert */}
                  {igSuccessMessage && (
                    <div className="w-full mt-3 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center space-x-2 text-xs text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{igSuccessMessage}</span>
                    </div>
                  )}
                </div>

                {/* AI Design Decision Card */}
                {result.creativeBrief && (
                  <div className="w-full bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-navy-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Creative Breakdown</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Automated Reasoning</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Visual Concept:</span>
                        <p className="text-slate-200 font-medium">{result.creativeBrief.visualConcept}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Atmosphere & Lighting:</span>
                        <p className="text-slate-200 font-medium">{result.creativeBrief.lighting || result.creativeBrief.atmosphere}</p>
                      </div>
                    </div>

                    {result.creativeBrief.designRationale && (
                      <div className="pt-2 border-t border-navy-800/80 text-xs">
                        <span className="text-[11px] text-slate-400 block">Design Strategy:</span>
                        <p className="text-slate-300 italic">{result.creativeBrief.designRationale}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Post-Generation Editing Drawer */}
                <div className="w-full bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
                  <button
                    onClick={() => setShowEditor(!showEditor)}
                    className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-gold-400" />
                      <span>Optional: Fine-Tune Text or Typography</span>
                    </span>
                    {showEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showEditor && (
                    <div className="p-5 border-t border-navy-800 space-y-4">
                      <p className="text-xs text-slate-400">
                        Adjust text layers directly. Updating text re-composites instantly on the AI artwork without consuming additional image generation credits.
                      </p>

                      <div className="space-y-3">
                        {editableTexts.map((item, idx) => (
                          <div key={item.id} className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                              <span>Layer: {item.id}</span>
                              <div className="flex items-center space-x-2">
                                <span>Size: {item.fontSize}px</span>
                                <input
                                  type="range"
                                  min="14"
                                  max="48"
                                  value={item.fontSize}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditableTexts(prev => prev.map((t, i) => i === idx ? { ...t, fontSize: val } : t));
                                  }}
                                  className="w-20 accent-gold-500"
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditableTexts(prev => prev.map((t, i) => i === idx ? { ...t, text: val } : t));
                              }}
                              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleUpdateText}
                        disabled={isUpdatingText}
                        className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingText ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Update Typography Preview</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="w-full bg-navy-900/60 border border-navy-800 rounded-2xl p-12 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 flex items-center justify-center">
                  <Wand2 className="w-8 h-8" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-base font-bold font-cinzel text-white">Your AI Poster Canvas</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your scripture reference and devotional theme on the left, then click <strong>Generate with AI</strong>. The AI will compose a bespoke visual scene and typography hierarchy.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
