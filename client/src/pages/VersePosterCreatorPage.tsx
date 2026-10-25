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
  FileText,
  Search,
  Dice5
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { CanvasPreview } from '../components/editor/CanvasPreview.js';
import { api } from '../services/api.js';
import { PairedVerse, TextOverlay } from '../types/index.js';

export const VersePosterCreatorPage: React.FC = () => {
  // Option Mode: 'english' | 'tamil' | 'bilingual'
  const [posterMode, setPosterMode] = useState<'english' | 'tamil' | 'bilingual'>('bilingual');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | '9:16'>('4:5');
  const [selectedTopic, setSelectedTopic] = useState('faith');

  // Active Scripture
  const [currentVerse, setCurrentVerse] = useState<PairedVerse | null>(null);
  const [verseReference, setVerseReference] = useState('Hebrews 11:1');
  const [englishText, setEnglishText] = useState('Now faith is the substance of things hoped for, the evidence of things not seen.');
  const [tamilText, setTamilText] = useState('விசுவாசமானது நம்பப்படுகிறவைகளின் உறுதியும், காணப்படாதவைகளின் நிச்சயமுமாயிருக்கிறது.');
  const [isVerified, setIsVerified] = useState(true);

  // Background Style
  const [bgPreset, setBgPreset] = useState('heavenly_gold');

  // AI Devotional Caption
  const [devotionalCaption, setDevotionalCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // Fetch initial verse
  useEffect(() => {
    loadVerseByTopic('faith');
  }, []);

  const loadVerseByTopic = async (topic: string) => {
    try {
      const res = await api.getRandomVerse(topic);
      if (res.data) {
        applyVerse(res.data);
      }
    } catch (err: any) {
      console.warn('Could not load random verse:', err.message);
    }
  };

  const applyVerse = (verse: PairedVerse) => {
    setCurrentVerse(verse);
    setVerseReference(verse.reference);
    setEnglishText(verse.english.text);
    setTamilText(verse.tamil.text);
    setIsVerified(verse.isVerified);
  };

  // Generate Devotional Reflection
  const handleGenerateCaption = async () => {
    try {
      setIsGeneratingCaption(true);
      const textToReflect = posterMode === 'tamil' ? tamilText : englishText;
      const res = await api.generateVerseCaption({
        verseReference,
        verseText: textToReflect,
        language: posterMode,
        topic: selectedTopic
      });

      if (res.data) {
        setDevotionalCaption(res.data.caption);
        if (res.data.hashtags) setHashtags(res.data.hashtags);
      }
    } catch (err: any) {
      alert('Failed to generate devotional caption: ' + err.message);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Build Dynamic Typography Layers based on Selected Option Mode
  const buildTextOverlays = (): TextOverlay[] => {
    const overlays: TextOverlay[] = [];

    if (posterMode === 'english') {
      // Option A: English Only
      overlays.push({
        id: 'eng_text',
        text: `"${englishText}"`,
        x: 50,
        y: 40,
        fontSize: 34,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '600',
        align: 'center',
        shadow: true
      });
      overlays.push({
        id: 'ref',
        text: `— ${verseReference} (KJV) —`,
        x: 50,
        y: 65,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true
      });
    } else if (posterMode === 'tamil') {
      // Option B: Tamil Only
      overlays.push({
        id: 'tam_text',
        text: `"${tamilText}"`,
        x: 50,
        y: 40,
        fontSize: 32,
        fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });
      overlays.push({
        id: 'ref',
        text: `— ${verseReference} —`,
        x: 50,
        y: 65,
        fontSize: 22,
        fontFamily: "'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true
      });
    } else {
      // Option C: Combined English + Tamil
      overlays.push({
        id: 'eng_text',
        text: `"${englishText}"`,
        x: 50,
        y: 28,
        fontSize: 26,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '600',
        align: 'center',
        shadow: true
      });

      // Decorative divider text
      overlays.push({
        id: 'divider',
        text: '❖  ❖  ❖',
        x: 50,
        y: 48,
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
        color: '#D4AF37',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      });

      overlays.push({
        id: 'tam_text',
        text: `"${tamilText}"`,
        x: 50,
        y: 56,
        fontSize: 24,
        fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
        color: '#F4EBD9',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      overlays.push({
        id: 'ref',
        text: `— ${verseReference} —`,
        x: 50,
        y: 78,
        fontSize: 20,
        fontFamily: "'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true
      });
    }

    return overlays;
  };

  const textOverlays = buildTextOverlays();

  const handleSaveDraft = async () => {
    try {
      await api.saveProject({
        title: `Poster - ${verseReference}`,
        project_type: 'bible_poster',
        status: 'draft',
        input_data: {
          verseReference,
          englishText,
          tamilText,
          topic: selectedTopic,
          posterMode
        },
        design_preferences: {
          aspectRatio,
          background: {
            type: 'preset',
            value: bgPreset
          },
          texts: textOverlays,
          images: []
        }
      });
      alert('Verse poster saved to your projects!');
    } catch (err: any) {
      alert('Failed to save poster: ' + err.message);
    }
  };

  const topics = [
    { id: 'faith', label: 'Faith' },
    { id: 'hope', label: 'Hope' },
    { id: 'promises', label: "God's Promises" },
    { id: 'love', label: 'Love' },
    { id: 'prayer', label: 'Prayer' },
    { id: 'peace', label: 'Peace' },
    { id: 'strength', label: 'Strength' },
    { id: 'protection', label: 'Protection' },
    { id: 'wisdom', label: 'Wisdom' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'faithfulness', label: "God's Faithfulness" },
    { id: 'encouragement', label: 'Encouragement' },
    { id: 'salvation', label: 'Salvation' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gold-600/10 border border-gold-500/30 text-gold-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-cinzel text-white">Bible Verse Poster Creator</h1>
              <p className="text-xs text-slate-400">
                Verified Canonical Scripture in English, Tamil, and Bilingual Layouts
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-navy-700 hover:border-gold-500 text-slate-200 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>Save Project</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* THREE CLEARLY SEPARATED OPTIONS */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-gold-400 mb-2">
                Poster Language Mode
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPosterMode('english')}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    posterMode === 'english'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Option A<br/><span className="text-[11px] font-normal">English Poster</span>
                </button>

                <button
                  onClick={() => setPosterMode('tamil')}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    posterMode === 'tamil'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Option B<br/><span className="text-[11px] font-normal">Tamil Poster</span>
                </button>

                <button
                  onClick={() => setPosterMode('bilingual')}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all ${
                    posterMode === 'bilingual'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Option C<br/><span className="text-[11px] font-normal">English + Tamil</span>
                </button>
              </div>
            </div>

            {/* SCRIPTURE & TOPIC SELECTION */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Scripture Topic & Verified Text
                </label>
                <button
                  onClick={() => loadVerseByTopic(selectedTopic)}
                  className="flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 bg-gold-500/10 px-2 py-1 rounded-lg border border-gold-500/30"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Random Verse</span>
                </button>
              </div>

              {/* Topic Select */}
              <select
                value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value);
                  loadVerseByTopic(e.target.value);
                }}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              {/* Reference */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bible Reference</label>
                <input
                  type="text"
                  value={verseReference}
                  onChange={(e) => setVerseReference(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                />
              </div>

              {/* English Text Input */}
              {(posterMode === 'english' || posterMode === 'bilingual') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">English Verse Text (KJV Verified)</label>
                    {isVerified && <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5"><CheckCircle2 className="w-3 h-3"/><span>Verified</span></span>}
                  </div>
                  <textarea
                    rows={3}
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed font-serif"
                  />
                </div>
              )}

              {/* Tamil Text Input */}
              {(posterMode === 'tamil' || posterMode === 'bilingual') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Tamil Verse Text (BSI Union Verified)</label>
                    {isVerified && <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5"><CheckCircle2 className="w-3 h-3"/><span>Verified</span></span>}
                  </div>
                  <textarea
                    rows={3}
                    value={tamilText}
                    onChange={(e) => setTamilText(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed font-tamil"
                  />
                </div>
              )}
            </div>

            {/* SPIRITUAL BACKGROUND STYLES & ASPECT RATIOS */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Poster Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '4:5', label: '4:5 Portrait (Default)' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '9:16', label: '9:16 Story' },
                  ].map(ar => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id as any)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
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

              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Spiritual Background Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'heavenly_gold', label: 'Heavenly Golden Light' },
                    { id: 'deep_navy_gold', label: 'Deep Navy & Gold' },
                    { id: 'sunrise_mountains', label: 'Sunrise Mountains' },
                    { id: 'starry_night', label: 'Starry Night Sky' },
                    { id: 'cross_silhouette', label: 'Cross Silhouette' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setBgPreset(style.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        bgPreset === style.id
                          ? 'border-gold-500 bg-gold-500/15 text-gold-300 font-bold'
                          : 'border-navy-700 bg-navy-950 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI DEVOTIONAL CAPTION & HASHTAGS GENERATOR */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Devotional Caption & Hashtags
                </span>
                <button
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption}
                  className="flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/30 disabled:opacity-50"
                >
                  {isGeneratingCaption ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  <span>Generate Caption</span>
                </button>
              </div>

              {devotionalCaption ? (
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-700/60 text-xs space-y-2">
                  <p className="text-slate-200 leading-relaxed italic">"{devotionalCaption}"</p>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-navy-800">
                      {hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-gold-400 font-mono">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Click "Generate Caption" to create an inspiring devotional reflection and hashtags to accompany your poster on social media.
                </p>
              )}
            </div>
          </div>

          {/* Live Canvas Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full bg-navy-900/60 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
              <CanvasPreview
                type="bible_poster"
                aspectRatio={aspectRatio}
                title={`Bible Poster - ${verseReference}`}
                background={{
                  type: 'preset',
                  value: bgPreset
                }}
                texts={textOverlays}
                images={[]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
