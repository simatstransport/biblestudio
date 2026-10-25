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

// Popular Quick Select Scriptures with verified texts & authentic visual concepts
const POPULAR_VERSES = [
  {
    ref: 'John 3:16',
    label: 'John 3:16 (Love & Cross)',
    english: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    tamil: 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.',
    theme: "God's Boundless Love & Eternal Salvation",
    atmosphere: "Sacrificial love, radiant hope, eternal grace, celestial warmth",
    visual: "Mount Calvary silhouette with the holy cross bathed in radiant dawn golden rays and ethereal morning clouds"
  },
  {
    ref: 'Psalm 23:1',
    label: 'Psalm 23:1 (Good Shepherd)',
    english: 'The LORD is my shepherd; I shall not want.',
    tamil: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.',
    theme: "The Lord My Shepherd & Restorer",
    atmosphere: "Peaceful, tranquil, restoring, deep serene stillness",
    visual: "Gentle shepherd with staff beside tranquil still waters and lush green pastures under golden morning light"
  },
  {
    ref: 'Matthew 11:28',
    label: 'Matthew 11:28 (Rest & Embrace)',
    english: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.',
    tamil: 'வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.',
    theme: "Divine Rest & Tender Compassion",
    atmosphere: "Warm, peaceful, intimate divine presence, golden hour glow",
    visual: "Jesus embracing a young believer tenderly with golden backlight"
  },
  {
    ref: 'Jeremiah 29:11',
    label: 'Jeremiah 29:11 (Hope & Future)',
    english: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
    tamil: 'நீங்கள் எதிர்பார்த்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு நான் உங்களைக்குறித்து நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்; அவைகள் தீமைக்கல்ல, சமாதானத்துக்கேதுவான நினைவுகளே.',
    theme: "Hope, Divine Purpose & Expected End",
    atmosphere: "Uplifting assurance, serene peace, bright horizon glow",
    visual: "Tranquil winding pathway opening toward a radiant sunrise over hills of promise"
  },
  {
    ref: 'Philippians 4:13',
    label: 'Phil 4:13 (Strength in Christ)',
    english: 'I can do all things through Christ which strengtheneth me.',
    tamil: 'என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.',
    theme: "Strength & Triumph Through Christ",
    atmosphere: "Empowering divine energy, soaring victory, celestial brilliance",
    visual: "Glorious golden eagle soaring above rugged mountain peaks bathed in brilliant sunrise"
  },
  {
    ref: '1 Kings 8:15',
    label: '1 Kings 8:15 (Temple & Covenant)',
    english: 'Blessed be the LORD God of Israel, which spake with his mouth unto David my father, and hath with his hand fulfilled it, saying,',
    tamil: 'அவர் என் தகப்பனாகிய தாவீதோடே தம்முடைய வாக்கினால் சொன்னதை தம்முடைய கரத்தினால் நிறைவேற்றி, சொல்லியதாவது: இஸ்ரவேலின் தேவனாகிய கர்த்தருக்கு ஸ்தோத்திரம்.',
    theme: "Faithfulness & Sacred Covenant",
    atmosphere: "Reverent awe, majestic, sacred temple worship",
    visual: "Ancient Solomon's temple stone colonnade with celestial sun rays breaking through incense mist"
  }
];

export function detectLocalNuances(ref: string, text?: string): {
  themeTitle: string;
  atmosphere: string;
  visualPreferences: string;
} {
  const normRef = ref.toLowerCase().replace(/\s+/g, '');
  const match = POPULAR_VERSES.find(v => v.ref.toLowerCase().replace(/\s+/g, '') === normRef);
  if (match) {
    return {
      themeTitle: match.theme,
      atmosphere: match.atmosphere,
      visualPreferences: match.visual
    };
  }

  const combined = `${ref} ${text || ''}`.toLowerCase();

  if (/john 3:16|cross|calvary|crucifix|salvation|savior|redeem|loved the world|gave his only|sacrific/i.test(combined)) {
    return {
      themeTitle: "God's Boundless Love & Eternal Salvation",
      atmosphere: "Sacrificial love, radiant hope, eternal grace, celestial warmth",
      visualPreferences: "Mount Calvary silhouette with the holy cross bathed in radiant dawn golden rays and ethereal morning clouds"
    };
  }

  if (/labour|labor|heavy laden|rest|gentle|embrace|weary|burden|matthew 11/i.test(combined)) {
    return {
      themeTitle: "Divine Rest & Tender Compassion",
      atmosphere: "Warm, peaceful, intimate divine presence, golden hour glow",
      visualPreferences: "Jesus embracing a young believer tenderly with golden backlight"
    };
  }

  if (/shepherd|pasture|still waters|green pastures|restore|psalm 23/i.test(combined)) {
    return {
      themeTitle: "The Lord My Shepherd & Restorer",
      atmosphere: "Peaceful, tranquil, restoring, deep serene stillness",
      visualPreferences: "Gentle shepherd with staff beside tranquil still waters and lush green pastures under golden morning light"
    };
  }

  if (/temple|solomon|sanctuary|altar|ark of|covenant|1 kings|chronicles|priest/i.test(combined)) {
    return {
      themeTitle: "Faithfulness & Sacred Covenant",
      atmosphere: "Reverent awe, majestic, sacred temple worship",
      visualPreferences: "Ancient Solomon's temple stone colonnade with celestial sun rays breaking through incense mist"
    };
  }

  if (/storm|waves|sea|boat|water|drown|fear not|overcome|wind|matthew 14/i.test(combined)) {
    return {
      themeTitle: "Breakthrough & Deliverance in the Storm",
      atmosphere: "Dramatic breakthrough, divine authority over fear, triumphant calm",
      visualPreferences: "Stormy Galilean waves parting under a focused beam of celestial golden sunlight"
    };
  }

  if (/strength|strong|courage|eagles|mount up|not faint|philippians 4|isaiah 40/i.test(combined)) {
    return {
      themeTitle: "Strength, Renewal & Triumph Through Christ",
      atmosphere: "Empowering divine energy, soaring victory, celestial brilliance",
      visualPreferences: "Glorious golden eagle soaring above rugged mountain peaks bathed in brilliant sunrise"
    };
  }

  if (/refuge|fortress|shadow|almighty|wings|shield|psalm 91/i.test(combined)) {
    return {
      themeTitle: "Under the Shadow of the Almighty",
      atmosphere: "Invincible security, sacred peace, luminous golden aura",
      visualPreferences: "Ancient stone fortress perched high on a cliff enveloped in protective celestial light"
    };
  }

  if (/peace|careful for nothing|anxious|anxiety|philippians 4:6/i.test(combined)) {
    return {
      themeTitle: "The Peace That Surpasses Understanding",
      atmosphere: "Gentle stillness, calming tranquility, soft golden dusk",
      visualPreferences: "Quiet tranquil olive grove with soft radiant light filtering through gentle leaves"
    };
  }

  if (/trust|heart|understanding|direct thy paths|proverbs 3/i.test(combined)) {
    return {
      themeTitle: "Trust in the Lord with All Your Heart",
      atmosphere: "Serene guidance, clear path, bright horizon glow",
      visualPreferences: "A straight sunlit stone path cutting smoothly through an ancient forest toward radiant daylight"
    };
  }

  return {
    themeTitle: "Divine Grace & Everlasting Promise",
    atmosphere: "Celestial warmth, peaceful reverent presence, golden dawn glow",
    visualPreferences: "Ethereal sunrise over biblical hills with glorious parting clouds and radiant divine light"
  };
}

export const VersePosterCreatorPage: React.FC = () => {
  // 1. User Input Form State - Defaults cleanly to John 3:16 with automatic matching theme
  const [verseReference, setVerseReference] = useState('John 3:16');
  const [verseText, setVerseText] = useState('For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.');
  const [language, setLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [purposeOrTheme, setPurposeOrTheme] = useState("God's Boundless Love & Eternal Salvation");
  const [translation, setTranslation] = useState('King James Version (KJV)');
  const [atmosphere, setAtmosphere] = useState('Sacrificial love, radiant hope, eternal grace, celestial warmth');
  const [visualPreferences, setVisualPreferences] = useState('Mount Calvary silhouette with the holy cross bathed in radiant dawn golden rays and ethereal morning clouds');
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

  // Quick Select Preset Verse
  const handleSelectPopularVerse = (preset: typeof POPULAR_VERSES[0]) => {
    setVerseReference(preset.ref);
    if (language === 'tamil') {
      setVerseText(preset.tamil);
    } else if (language === 'bilingual') {
      setVerseText(`${preset.english}\n\n${preset.tamil}`);
    } else {
      setVerseText(preset.english);
    }
    setPurposeOrTheme(preset.theme);
    setAtmosphere(preset.atmosphere);
    setVisualPreferences(preset.visual);
  };

  // Auto-Detect & Update Theme & Visual Concept from Current Verse
  const handleAutoDetectNuances = () => {
    const nuances = detectLocalNuances(verseReference, verseText);
    setPurposeOrTheme(nuances.themeTitle);
    setAtmosphere(nuances.atmosphere);
    setVisualPreferences(nuances.visualPreferences);
  };

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

        // Auto-adapt theme, atmosphere, and visual concept
        const nuances = detectLocalNuances(res.data.reference, res.data.english.text);
        setPurposeOrTheme(res.data.themeTitle || nuances.themeTitle);
        setAtmosphere(res.data.suggestedAtmosphere || nuances.atmosphere);
        setVisualPreferences(res.data.suggestedVisualConcept || nuances.visualPreferences);
      } else {
        // Fallback for custom verses not in the verified list
        handleAutoDetectNuances();
      }
    } catch {
      handleAutoDetectNuances();
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

      // Ensure nuances match verse if user left anything blank
      const currentNuances = detectLocalNuances(verseReference, verseText);
      const finalTheme = purposeOrTheme.trim() || currentNuances.themeTitle;
      const finalAtmosphere = atmosphere.trim() || currentNuances.atmosphere;
      const finalVisual = visualPreferences.trim() || currentNuances.visualPreferences;

      const res = await api.generatePosterAI({
        verseReference,
        verseText,
        language,
        purposeOrTheme: finalTheme,
        translation,
        atmosphere: finalAtmosphere,
        visualPreferences: finalVisual,
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
                    placeholder="e.g. John 3:16, Psalm 23:1, Matthew 11:28"
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

                {/* Popular Quick Select Chips */}
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                    Quick Scripture Select:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_VERSES.map((v) => (
                      <button
                        key={v.ref}
                        type="button"
                        onClick={() => handleSelectPopularVerse(v)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          verseReference.toLowerCase().replace(/\s+/g, '') === v.ref.toLowerCase().replace(/\s+/g, '')
                            ? 'bg-gold-500/20 border-gold-500 text-gold-300 font-bold shadow-sm'
                            : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-slate-200 hover:border-navy-700'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-200">
                    Devotional Purpose or Theme
                  </label>
                  <span className="text-[10px] text-gold-400 font-medium">Auto-derived from verse</span>
                </div>
                <input
                  type="text"
                  value={purposeOrTheme}
                  onChange={(e) => setPurposeOrTheme(e.target.value)}
                  placeholder="Auto-derived according to scripture (e.g. God's Boundless Love & Salvation)"
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

            {/* Optional Creative Nuances */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-navy-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Optional Creative Nuances
                </span>
                <button
                  type="button"
                  onClick={handleAutoDetectNuances}
                  className="text-[10px] text-gold-400 hover:text-gold-300 font-semibold flex items-center space-x-1 cursor-pointer bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 px-2 py-0.5 rounded-lg transition-all"
                  title="Auto-detect atmosphere and visual concept matching this verse"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Auto-Detect from Verse</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                These creative parameters adapt automatically to each scripture. You can edit them or leave them as dynamically suggested.
              </p>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Desired Emotional Atmosphere <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={atmosphere}
                    onChange={(e) => setAtmosphere(e.target.value)}
                    placeholder="e.g. Sacrificial love, radiant hope, eternal grace, celestial warmth"
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Visual Concept Preferences <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={visualPreferences}
                    onChange={(e) => setVisualPreferences(e.target.value)}
                    placeholder="e.g. Mount Calvary silhouette with holy cross bathed in radiant dawn golden rays"
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500 leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic AI Scene & Concept Preview Pill */}
            <div className="p-3.5 bg-navy-950/80 border border-gold-500/20 rounded-2xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-gold-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>Scripture-Adaptive Scene Concept</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-gold-300">{purposeOrTheme || 'Divine Grace'}:</strong> {visualPreferences || atmosphere || 'Cinematic sacred vista bathed in celestial golden light.'}
              </p>
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

                  {/* Creative Rationale Callout */}
                  {result.creativeBrief?.designRationale && (
                    <div className="mt-4 p-3 bg-navy-950 border border-navy-800 rounded-xl text-left w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 block mb-1">
                        AI Design Rationale:
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{result.creativeBrief.designRationale}"
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full mt-5 pt-4 border-t border-navy-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download 4K PNG</span>
                      </button>

                      <button
                        onClick={handleSaveProject}
                        disabled={isSavingProject}
                        className="px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-semibold text-xs border border-navy-700 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-slate-300" />
                        <span>{isSavingProject ? 'Saving...' : 'Save to Projects'}</span>
                      </button>
                    </div>

                    <button
                      onClick={handlePublishToInstagram}
                      disabled={isPublishingIg}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isPublishingIg ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing to Instagram...</span>
                        </>
                      ) : (
                        <>
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Publish to Instagram</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Instagram Success Alert */}
                  {igSuccessMessage && (
                    <div className="mt-3 w-full p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center space-x-2 text-xs text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{igSuccessMessage}</span>
                    </div>
                  )}
                </div>

                {/* Optional Typography Finetuning Accordion */}
                <div className="w-full bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
                  <button
                    onClick={() => setShowEditor(!showEditor)}
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-gold-400" />
                      <span>Typography & Layout Fine-Tuning</span>
                    </span>
                    {showEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showEditor && (
                    <div className="mt-4 pt-4 border-t border-navy-800 space-y-4">
                      <p className="text-xs text-slate-400">
                        Adjust text overlay positions, font sizes, or colors directly without altering the background artwork.
                      </p>

                      <div className="space-y-3">
                        {editableTexts.map((txt, index) => (
                          <div key={txt.id || index} className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-gold-400">Layer {index + 1} ({txt.id})</span>
                              <input
                                type="color"
                                value={txt.color || '#FFFFFF'}
                                onChange={(e) => {
                                  const updated = [...editableTexts];
                                  updated[index].color = e.target.value;
                                  setEditableTexts(updated);
                                }}
                                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                              />
                            </div>
                            <input
                              type="text"
                              value={txt.text}
                              onChange={(e) => {
                                const updated = [...editableTexts];
                                updated[index].text = e.target.value;
                                setEditableTexts(updated);
                              }}
                              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                              <div>
                                <span>Font Size ({txt.fontSize}px)</span>
                                <input
                                  type="range"
                                  min={12}
                                  max={120}
                                  value={txt.fontSize}
                                  onChange={(e) => {
                                    const updated = [...editableTexts];
                                    updated[index].fontSize = Number(e.target.value);
                                    setEditableTexts(updated);
                                  }}
                                  className="w-full"
                                />
                              </div>
                              <div>
                                <span>Vertical Position ({Math.round(txt.y)}%)</span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={txt.y}
                                  onChange={(e) => {
                                    const updated = [...editableTexts];
                                    updated[index].y = Number(e.target.value);
                                    setEditableTexts(updated);
                                  }}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleUpdateText}
                        disabled={isUpdatingText}
                        className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-gold-500/20 text-gold-400 border border-gold-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingText ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>Apply Typography Updates</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty Placeholder State */
              <div className="w-full h-full min-h-[520px] bg-navy-900/40 border-2 border-dashed border-navy-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-lg font-bold text-white">Your Masterpiece Awaits</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select a scripture or enter your verse reference. The AI Creative Director will design a custom photorealistic scene and render verified scripture typography.
                  </p>
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate John 3:16 Poster</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
