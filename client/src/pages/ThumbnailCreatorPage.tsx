import React, { useState } from 'react';
import { 
  Tv, 
  Upload, 
  Sparkles, 
  X, 
  Image as ImageIcon, 
  Type, 
  Calendar, 
  Phone, 
  Palette, 
  CheckCircle2, 
  RefreshCw,
  Save,
  Download,
  Flame,
  Wand2,
  Zap,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { CanvasPreview } from '../components/editor/CanvasPreview.js';
import { api } from '../services/api.js';
import { TextOverlay, ImageOverlay } from '../types/index.js';

export const ThumbnailCreatorPage: React.FC = () => {
  // Active Tab: 'content' | 'style' | 'media' | 'event' | 'ai_bg'
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'media' | 'event' | 'ai_bg'>('content');

  // Form State
  const [mainTitle, setMainTitle] = useState('UNSTOPPABLE FAITH');
  const [subtitle, setSubtitle] = useState('How To Overcome Any Storm');
  const [callToAction, setCallToAction] = useState('WATCH NOW');
  const [channelName, setChannelName] = useState('Faith Media');
  const [language, setLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [theme, setTheme] = useState('Cinematic');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Viral Attention-Grabber Badge
  const [showBadge, setShowBadge] = useState(true);
  const [badgeText, setBadgeText] = useState('🔥 MUST WATCH');

  // Text Styling & 3D Stroke
  const [stylePreset, setStylePreset] = useState<'viral_beast' | 'divine_gold' | 'electric_neon' | 'urgent_red' | 'clean_modern'>('viral_beast');
  const [titleColor, setTitleColor] = useState('#FFE600');
  const [titleStroke, setTitleStroke] = useState('#000000');
  const [titleStrokeWidth, setTitleStrokeWidth] = useState(8);
  const [subtitleColor, setSubtitleColor] = useState('#FFFFFF');

  // Media Uploads & Subject Glow
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Array<{ id: string; url: string; isMain: boolean }>>([]);
  const [subjectGlow, setSubjectGlow] = useState(true);

  // Contact & Event Details
  const [includeContact, setIncludeContact] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [venue, setVenue] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [socialHandle, setSocialHandle] = useState('@FaithCreator');

  const [includeEvent, setIncludeEvent] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [timezone, setTimezone] = useState('EST');

  // Background Selection
  const [bgPreset, setBgPreset] = useState('cinematic_bold');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  // AI Assistant & DALL-E 3
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingAIBg, setIsGeneratingAIBg] = useState(false);
  const [aiBgPrompt, setAiBgPrompt] = useState('Dramatic storm at sea with glowing golden heavenly light beam breaking through dark storm clouds, cinematic lighting, 8k wallpaper');

  // Canvas State
  const [selectedTextId, setSelectedTextId] = useState<string | null>('title');
  const [isSaving, setIsSaving] = useState(false);

  // Apply style preset
  const applyStylePreset = (preset: 'viral_beast' | 'divine_gold' | 'electric_neon' | 'urgent_red' | 'clean_modern') => {
    setStylePreset(preset);
    if (preset === 'viral_beast') {
      setTitleColor('#FFE600');
      setTitleStroke('#000000');
      setTitleStrokeWidth(8);
      setSubtitleColor('#FFFFFF');
      setBadgeText('🔥 MUST WATCH');
    } else if (preset === 'divine_gold') {
      setTitleColor('#FFD700');
      setTitleStroke('#1A0E00');
      setTitleStrokeWidth(6);
      setSubtitleColor('#FFF8E7');
      setBadgeText('✝ LIFE CHANGING');
    } else if (preset === 'electric_neon') {
      setTitleColor('#00F0FF');
      setTitleStroke('#050B18');
      setTitleStrokeWidth(7);
      setSubtitleColor('#FF007F');
      setBadgeText('⚡ 100% REVEALED');
    } else if (preset === 'urgent_red') {
      setTitleColor('#FF1744');
      setTitleStroke('#000000');
      setTitleStrokeWidth(8);
      setSubtitleColor('#FFFFFF');
      setBadgeText('⚠️ DO NOT IGNORE');
    } else if (preset === 'clean_modern') {
      setTitleColor('#FFFFFF');
      setTitleStroke('');
      setTitleStrokeWidth(0);
      setSubtitleColor('#E6CA65');
      setBadgeText('🔴 LIVE SERMON');
    }
  };

  // Construct text overlays dynamically with viral stroke & typography
  const textOverlays: TextOverlay[] = [
    // 1. Attention-Grabber Sticker Badge
    ...(showBadge && badgeText ? [{
      id: 'badge',
      text: badgeText,
      x: 8,
      y: 15,
      fontSize: 18,
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF',
      fontWeight: '900',
      align: 'left' as const,
      shadow: true,
      stroke: '#000000',
      strokeWidth: 4,
      backgroundColor: 'rgba(255, 30, 60, 0.9)'
    }] : []),

    // 2. Main Title (High Impact, 3D Stroke)
    {
      id: 'title',
      text: mainTitle,
      x: 8,
      y: showBadge ? 32 : 25,
      fontSize: 56,
      fontFamily: language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
      color: titleColor,
      fontWeight: '900',
      align: 'left',
      shadow: true,
      stroke: titleStroke || undefined,
      strokeWidth: titleStroke ? titleStrokeWidth : undefined
    },

    // 3. Subtitle Hook
    {
      id: 'subtitle',
      text: subtitle,
      x: 8,
      y: showBadge ? 55 : 48,
      fontSize: 28,
      fontFamily: language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
      color: subtitleColor,
      fontWeight: '700',
      align: 'left',
      shadow: true,
      stroke: titleStroke ? '#000000' : undefined,
      strokeWidth: titleStroke ? 4 : undefined
    },

    // 4. Call To Action (CTA)
    ...(callToAction ? [{
      id: 'cta',
      text: `▶ ${callToAction}`,
      x: 8,
      y: showBadge ? 75 : 68,
      fontSize: 22,
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF',
      fontWeight: '800',
      align: 'left' as const,
      shadow: true,
      stroke: '#000000',
      strokeWidth: 4
    }] : []),

    // 5. Channel Name
    ...(channelName ? [{
      id: 'channel',
      text: channelName.toUpperCase(),
      x: 8,
      y: 88,
      fontSize: 15,
      fontFamily: "'Inter', sans-serif",
      color: '#D4AF37',
      fontWeight: '700',
      align: 'left' as const,
      shadow: true
    }] : [])
  ];

  // Construct image overlays (logo + subjects with rim-light glow)
  const imageOverlays: ImageOverlay[] = [
    ...(logoUrl ? [{
      id: 'logo',
      type: 'logo' as const,
      url: logoUrl,
      x: 84,
      y: 6,
      width: 12,
      height: 12
    }] : []),
    ...subjects.map((sub, idx) => ({
      id: sub.id,
      type: 'subject' as const,
      url: sub.url,
      x: sub.isMain ? 58 : 45 + idx * 15,
      y: 12,
      width: 40,
      height: 88,
      borderRadius: 12,
      glow: subjectGlow
    }))
  ];

  // Logo File Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await api.uploadAsset(file, 'logo');
      setLogoUrl(res.url);
    } catch (err: any) {
      alert('Failed to upload logo: ' + err.message);
    }
  };

  // Subject File Upload
  const handleSubjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await api.uploadAsset(files[i], 'subject');
        setSubjects(prev => [...prev, {
          id: 'sub-' + Date.now() + '-' + i,
          url: res.url,
          isMain: prev.length === 0
        }]);
      }
    } catch (err: any) {
      alert('Failed to upload subject photo: ' + err.message);
    }
  };

  // AI Hook Assistant
  const handleGenerateHooks = async () => {
    try {
      setIsGeneratingBrief(true);
      const res = await api.generateThumbnailBrief({
        mainTitle,
        subtitle,
        callToAction,
        channelName,
        language,
        theme,
        additionalInstructions: additionalNotes
      });

      if (res.data?.titleSuggestions) {
        setAiSuggestions(res.data.titleSuggestions);
      }
      if (res.data?.subtitleHook) {
        setSubtitle(res.data.subtitleHook);
      }
    } catch (err: any) {
      alert('AI Assistant error: ' + err.message);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // Generate AI Cinematic Background via DALL-E 3
  const handleGenerateAIBackground = async (promptToUse?: string) => {
    const activePrompt = promptToUse || aiBgPrompt;
    if (!activePrompt.trim()) return;

    try {
      setIsGeneratingAIBg(true);
      const res = await api.generateImage(activePrompt, '16:9', 'thumbnail_background');
      if (res.imageUrl) {
        setCustomBgImage(res.imageUrl);
        alert('✨ DALL-E 3 16:9 Cinematic Thumbnail Background generated and applied!');
      } else if (res.presetFallback) {
        setBgPreset(res.preset || 'cinematic_bold');
        setCustomBgImage(null);
        alert('Studio preset background applied: ' + (res.message || 'Ready!'));
      }
    } catch (err: any) {
      alert('AI Generation error: ' + err.message);
    } finally {
      setIsGeneratingAIBg(false);
    }
  };

  // Save Project
  const handleSaveProject = async () => {
    try {
      setIsSaving(true);
      await api.saveProject({
        title: mainTitle,
        project_type: 'youtube_thumbnail',
        status: 'draft',
        input_data: {
          mainTitle,
          subtitle,
          callToAction,
          channelName,
          language,
          theme,
          stylePreset,
          showBadge,
          badgeText
        },
        design_preferences: {
          aspectRatio: '16:9',
          background: {
            type: customBgImage ? 'image' : 'preset',
            value: customBgImage || bgPreset
          },
          texts: textOverlays,
          images: imageOverlays,
          contactInfo: {
            enabled: includeContact,
            text: socialHandle || contactNumber
          },
          eventInfo: {
            enabled: includeEvent,
            text: eventDate ? `${eventDate} • ${eventTime}` : undefined
          }
        }
      });
      alert('Project saved to your dashboard successfully!');
    } catch (err: any) {
      alert('Failed to save project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const aiThumbnailPresets = [
    { label: "🔥 Dark Arena with God Rays", prompt: "Dramatic dark cinematic arena with powerful golden light beam slicing through shadows, volumetric dust particles, epic atmosphere, 8k" },
    { label: "⚡ Ocean Lightning Storm", prompt: "Violent dark ocean storm with purple and blue lightning tearing through clouds, dramatic cinematic lighting, photorealistic 8K wallpaper" },
    { label: "🏛 Ancient Holy Temple", prompt: "King Solomon ancient temple pillars at twilight with heavenly golden glow and warm shadows, cinematic 8k" },
    { label: "🌌 Deep Space Star Nebula", prompt: "Deep space cosmic nebula with glowing celestial violet and cyan stars, radiant galaxy explosion, photorealistic 8k" },
    { label: "🎙 Modern Studio Neon Rim", prompt: "Modern cinematic broadcast studio stage with intense neon purple and electric cyan backlight beams, clean negative space, 8k" },
    { label: "⚔ Sunset Fiery Mountains", prompt: "Majestic rugged mountain peaks under a blazing fiery orange and crimson sunset sky, epic scale, 8k wallpaper" }
  ];

  const viralBadgeOptions = [
    '🔥 MUST WATCH',
    '✝ LIFE CHANGING',
    '🔴 LIVE SERMON',
    '⚡ 100% REVEALED',
    '⚠️ DO NOT IGNORE',
    '🙏 POWERFUL PRAYER',
    '👑 KING OF KINGS'
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Viral YouTube Thumbnail Creator</h1>
              <p className="text-xs text-slate-400">
                High-CTR 2026 Viral Presets • 3D Stroke Typography • AI DALL-E 3 Backgrounds
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveProject}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-navy-700 hover:border-gold-500 text-slate-200 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step Tabs */}
            <div className="flex border-b border-navy-800 space-x-1 overflow-x-auto pb-1">
              {[
                { id: 'content', label: '1. Titles & Badges', icon: Type },
                { id: 'style', label: '2. Viral Styles', icon: Palette },
                { id: 'ai_bg', label: '3. AI Background', icon: Wand2 },
                { id: 'media', label: '4. Subject Glow', icon: ImageIcon },
                { id: 'event', label: '5. Event Details', icon: Calendar },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-gold-500 text-gold-400'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: CONTENT, TITLES & ATTENTION BADGES */}
            {activeTab === 'content' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
                {/* Viral Attention Sticker Badge */}
                <div className="p-3.5 bg-gradient-to-r from-red-950/40 to-navy-950 rounded-xl border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Attention-Grabber Sticker Badge</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showBadge}
                      onChange={(e) => setShowBadge(e.target.checked)}
                      className="rounded accent-red-500 cursor-pointer"
                    />
                  </div>
                  {showBadge && (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {viralBadgeOptions.map((b, i) => (
                          <button
                            key={i}
                            onClick={() => setBadgeText(b)}
                            className={`text-[10px] px-2 py-0.5 rounded font-bold transition-all ${
                              badgeText === b
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-navy-900 border border-navy-700 text-slate-300 hover:border-red-500'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="Custom badge text..."
                        className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Thumbnail Typography
                  </h3>
                  <button
                    onClick={handleGenerateHooks}
                    disabled={isGeneratingBrief}
                    className="flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 font-semibold bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/30 cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingBrief ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>AI Hook Ideas</span>
                  </button>
                </div>

                {/* AI Suggestions Pill Bar */}
                {aiSuggestions.length > 0 && (
                  <div className="p-3 bg-navy-950 rounded-xl border border-navy-700/60 space-y-2">
                    <p className="text-[11px] font-semibold text-gold-400">Click to apply suggested AI Title:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => setMainTitle(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-700 hover:border-gold-500 text-slate-200 transition-colors text-left"
                        >
                          "{sug}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Main Title (Punchy, under 5 words for mobile)
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 font-extrabold uppercase tracking-wide"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subtitle or Supporting Hook
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Call-To-Action (CTA)</label>
                    <input
                      type="text"
                      placeholder="e.g. WATCH NOW"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Channel / Ministry Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grace TV"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="english">English (Latin Typography)</option>
                    <option value="tamil">Tamil (Unicode Font Typography)</option>
                    <option value="bilingual">Bilingual (English + Tamil)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: VIRAL STYLES & 3D STROKES */}
            {activeTab === 'style' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Viral High-CTR Style Presets
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'viral_beast', label: '🔥 High-CTR Viral Beast', desc: 'Electric Yellow with Thick 3D Black Stroke (MrBeast Style)' },
                    { id: 'divine_gold', label: '✨ Divine Radiant Gold', desc: 'Luxurious Gold Metallic with Deep Drop Shadow' },
                    { id: 'electric_neon', label: '⚡ Electric Cyber Neon', desc: 'Neon Cyan & Magenta Glow on Dark Atmospheric Vista' },
                    { id: 'urgent_red', label: '⚠️ Urgent Breaking Red', desc: 'High-Alert Red & White with Heavy Contrast Stroke' },
                    { id: 'clean_modern', label: '⚪ Crisp Minimalist', desc: 'Clean White Sans-Serif with Soft Cinematic Blur' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyStylePreset(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        stylePreset === preset.id
                          ? 'border-gold-500 bg-gold-500/15 ring-1 ring-gold-500/40 text-gold-300'
                          : 'border-navy-700 bg-navy-950 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-xs font-bold">{preset.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-navy-800 space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Fine-Tune Text Stroke Outline</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title Fill Color</label>
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="w-full h-8 bg-navy-950 border border-navy-700 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Outline Stroke Color</label>
                      <input
                        type="color"
                        value={titleStroke || '#000000'}
                        onChange={(e) => setTitleStroke(e.target.value)}
                        className="w-full h-8 bg-navy-950 border border-navy-700 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Stroke Thickness</span>
                      <span>{titleStrokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="14"
                      value={titleStrokeWidth}
                      onChange={(e) => setTitleStrokeWidth(Number(e.target.value))}
                      className="w-full accent-gold-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI BACKGROUND GENERATOR (DALL-E 3) */}
            {activeTab === 'ai_bg' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-gold-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI 16:9 Thumbnail Background (DALL-E 3)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400">
                  Generate photorealistic 16:9 widescreen backgrounds using your OpenAI API key with zero text distortions.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Prompt Description:</label>
                  <textarea
                    rows={3}
                    value={aiBgPrompt}
                    onChange={(e) => setAiBgPrompt(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                  />

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-gold-400 font-semibold">1-Click Prompt Presets:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {aiThumbnailPresets.map((p, i) => (
                        <button
                          key={i}
                          disabled={isGeneratingAIBg}
                          onClick={() => {
                            setAiBgPrompt(p.prompt);
                            handleGenerateAIBackground(p.prompt);
                          }}
                          className="p-2 rounded-xl bg-navy-950 border border-navy-700 hover:border-gold-500 text-left text-[11px] text-slate-300 hover:text-gold-300 transition-all"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleGenerateAIBackground()}
                    disabled={isGeneratingAIBg}
                    className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-gold-500 text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingAIBg ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering 16:9 Vista with DALL-E 3...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate 16:9 Background with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-3 border-t border-navy-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Or Pick Curated Studio Presets:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cinematic_bold', label: '🔥 Cinematic Energy' },
                      { id: 'heavenly_gold', label: '✨ Heavenly Golden Light' },
                      { id: 'deep_navy_gold', label: '🌌 Deep Navy & Gold' },
                      { id: 'sunrise_mountains', label: '🌄 Sunrise Mountains' },
                    ].map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setBgPreset(preset.id);
                          setCustomBgImage(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                          bgPreset === preset.id && !customBgImage
                            ? 'border-gold-500 bg-gold-500/15 text-gold-300 font-bold'
                            : 'border-navy-700 bg-navy-950 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SUBJECT PHOTO & RIM-LIGHT GLOW */}
            {activeTab === 'media' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5 shadow-xl">
                {/* Subject Rim-Light Glow Toggle */}
                <div className="p-3 bg-gradient-to-r from-gold-950/40 to-navy-950 rounded-xl border border-gold-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gold-400 block">Subject Rim-Light Glow</span>
                    <span className="text-[10px] text-slate-400">Radiant divine halo outline around subjects</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={subjectGlow}
                    onChange={(e) => setSubjectGlow(e.target.checked)}
                    className="rounded accent-gold-500 cursor-pointer"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Channel / Ministry Logo (Transparent PNG preferred)
                  </label>
                  {logoUrl ? (
                    <div className="flex items-center space-x-3 p-3 bg-navy-950 rounded-xl border border-navy-700">
                      <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-navy-900 rounded p-1" />
                      <div className="flex-1">
                        <span className="text-xs text-emerald-400 font-semibold">Logo uploaded</span>
                      </div>
                      <button
                        onClick={() => setLogoUrl(null)}
                        className="text-slate-400 hover:text-red-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-navy-700 hover:border-gold-500 rounded-xl cursor-pointer bg-navy-950/60 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-300">Click to upload channel logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Subject Image Uploads */}
                <div className="pt-3 border-t border-navy-800">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-white">
                      Presenter / Pastor Photos
                    </label>
                    <span className="text-[11px] text-slate-400">Cutout PNG or photo</span>
                  </div>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-navy-700 hover:border-gold-500 rounded-xl cursor-pointer bg-navy-950/60 transition-colors mb-3">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300">Upload speaker / presenter photos</span>
                    <input type="file" accept="image/*" multiple onChange={handleSubjectUpload} className="hidden" />
                  </label>

                  {subjects.length > 0 && (
                    <div className="space-y-2">
                      {subjects.map((sub, idx) => (
                        <div key={sub.id} className="flex items-center justify-between p-2 bg-navy-950 rounded-lg border border-navy-700 text-xs">
                          <img src={sub.url} alt="Subject" className="w-10 h-10 object-cover rounded" />
                          <span className="text-slate-300">
                            {sub.isMain ? '⭐ Main Subject' : `Subject #${idx + 1}`}
                          </span>
                          <button
                            onClick={() => setSubjects(prev => prev.filter(s => s.id !== sub.id))}
                            className="text-slate-400 hover:text-red-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: EVENT & CONTACT */}
            {activeTab === 'event' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5 shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white">Event Date & Time Badge</label>
                    <input
                      type="checkbox"
                      checked={includeEvent}
                      onChange={(e) => setIncludeEvent(e.target.checked)}
                      className="rounded accent-gold-500 cursor-pointer"
                    />
                  </div>

                  {includeEvent && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Date</label>
                        <input
                          type="text"
                          placeholder="e.g. Sunday, Nov 12"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 10:00 AM EST"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-navy-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white">Contact & Social Handle</label>
                    <input
                      type="checkbox"
                      checked={includeContact}
                      onChange={(e) => setIncludeContact(e.target.checked)}
                      className="rounded accent-gold-500 cursor-pointer"
                    />
                  </div>

                  {includeContact && (
                    <div className="space-y-2 pt-2">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Social Handle or Website</label>
                        <input
                          type="text"
                          placeholder="@GraceMinistry / www.grace.org"
                          value={socialHandle}
                          onChange={(e) => setSocialHandle(e.target.value)}
                          className="w-full bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Live Canvas Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full bg-navy-900/60 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center sticky top-6">
              <CanvasPreview
                type="youtube_thumbnail"
                aspectRatio="16:9"
                title={mainTitle}
                background={{
                  type: customBgImage ? 'image' : 'preset',
                  value: customBgImage || bgPreset
                }}
                texts={textOverlays}
                images={imageOverlays}
                contactInfo={{
                  enabled: includeContact,
                  text: socialHandle
                }}
                eventInfo={{
                  enabled: includeEvent,
                  text: eventDate ? `${eventDate} • ${eventTime}` : undefined
                }}
                selectedTextId={selectedTextId}
                onSelectText={setSelectedTextId}
              />

              <div className="w-full mt-4 p-3 bg-navy-950/80 rounded-xl border border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1280×720 Ultra-HD YouTube Standard Layout</span>
                </span>
                <span className="text-[11px] text-gold-400">High-CTR Contrast Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};