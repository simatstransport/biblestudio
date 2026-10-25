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
  Download
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { CanvasPreview } from '../components/editor/CanvasPreview.js';
import { api } from '../services/api.js';
import { TextOverlay, ImageOverlay } from '../types/index.js';

export const ThumbnailCreatorPage: React.FC = () => {
  // Active Tab / Step
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'event' | 'theme'>('content');

  // Form State
  const [mainTitle, setMainTitle] = useState('UNSTOPPABLE FAITH');
  const [subtitle, setSubtitle] = useState('How To Overcome Any Storm');
  const [callToAction, setCallToAction] = useState('WATCH NOW');
  const [channelName, setChannelName] = useState('Faith Media');
  const [language, setLanguage] = useState<'english' | 'tamil' | 'bilingual'>('english');
  const [theme, setTheme] = useState('Cinematic');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Media Uploads
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Array<{ id: string; url: string; isMain: boolean }>>([]);

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

  // AI Assistant Suggestions
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Canvas Layers
  const [selectedTextId, setSelectedTextId] = useState<string | null>('title');
  const [isSaving, setIsSaving] = useState(false);

  // Construct text overlays dynamically
  const textOverlays: TextOverlay[] = [
    {
      id: 'title',
      text: mainTitle,
      x: 8,
      y: 28,
      fontSize: 54,
      fontFamily: language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
      color: '#FFFFFF',
      fontWeight: '800',
      align: 'left',
      shadow: true
    },
    {
      id: 'subtitle',
      text: subtitle,
      x: 8,
      y: 52,
      fontSize: 28,
      fontFamily: language === 'tamil' ? "'Noto Sans Tamil', sans-serif" : "'Inter', sans-serif",
      color: '#E6CA65',
      fontWeight: '600',
      align: 'left',
      shadow: true
    },
    ...(callToAction ? [{
      id: 'cta',
      text: `▶ ${callToAction}`,
      x: 8,
      y: 72,
      fontSize: 20,
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF',
      fontWeight: '700',
      align: 'left' as const,
      shadow: true
    }] : []),
    ...(channelName ? [{
      id: 'channel',
      text: channelName.toUpperCase(),
      x: 8,
      y: 12,
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
      color: '#D4AF37',
      fontWeight: '700',
      align: 'left' as const,
      shadow: true
    }] : [])
  ];

  // Construct image overlays (logo + subject)
  const imageOverlays: ImageOverlay[] = [
    ...(logoUrl ? [{
      id: 'logo',
      type: 'logo' as const,
      url: logoUrl,
      x: 84,
      y: 8,
      width: 12,
      height: 12
    }] : []),
    ...subjects.map((sub, idx) => ({
      id: sub.id,
      type: 'subject' as const,
      url: sub.url,
      x: sub.isMain ? 60 : 45 + idx * 15,
      y: 15,
      width: 38,
      height: 85,
      borderRadius: 12
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
          theme
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

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">YouTube Thumbnail Creator</h1>
              <p className="text-xs text-slate-400">
                16:9 Ultra-HD Studio Studio with Deterministic Typography & AI Assistant
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

        {/* Studio Workspace: Form on Left, Canvas on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step Tabs */}
            <div className="flex border-b border-navy-800 space-x-1">
              {[
                { id: 'content', label: '1. Text & Titles', icon: Type },
                { id: 'media', label: '2. Subjects & Logo', icon: ImageIcon },
                { id: 'event', label: '3. Contact / Date', icon: Calendar },
                { id: 'theme', label: '4. Visual Style', icon: Palette },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
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

            {/* TAB 1: CONTENT & TITLES */}
            {activeTab === 'content' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <span>Thumbnail Typography</span>
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
                    Main Title (Keep punchy for high CTR)
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500 font-bold"
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

            {/* TAB 2: MEDIA UPLOADS (SUBJECT & LOGO) */}
            {activeTab === 'media' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5">
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
                      People / Subject Photos
                    </label>
                    <span className="text-[11px] text-slate-400">Preserves original likeness</span>
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

            {/* TAB 3: CONTACT & EVENT INFO */}
            {activeTab === 'event' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-5">
                {/* Event Date/Time */}
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

                {/* Contact Info */}
                <div className="pt-3 border-t border-navy-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-white">Contact & Social Handle Badge</label>
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

            {/* TAB 4: VISUAL THEME & BACKGROUND */}
            {activeTab === 'theme' && (
              <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4">
                <label className="block text-xs font-bold text-white mb-2">
                  Background Style Preset
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'cinematic_bold', label: 'Cinematic High-Energy' },
                    { id: 'heavenly_gold', label: 'Heavenly Golden Light' },
                    { id: 'deep_navy_gold', label: 'Deep Navy & Gold' },
                    { id: 'sunrise_mountains', label: 'Sunrise Mountains' },
                    { id: 'starry_night', label: 'Starry Night Sky' },
                    { id: 'cross_silhouette', label: 'Cross Silhouette' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setBgPreset(preset.id);
                        setCustomBgImage(null);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        bgPreset === preset.id && !customBgImage
                          ? 'border-gold-500 bg-gold-500/10 text-gold-400 font-bold'
                          : 'border-navy-700 bg-navy-950 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Canvas Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full bg-navy-900/60 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
