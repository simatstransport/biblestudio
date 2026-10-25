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
  Dice5,
  Wand2,
  Image as ImageIcon,
  Check,
  Flame,
  Heart
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar.js';
import { CanvasPreview } from '../components/editor/CanvasPreview.js';
import { api } from '../services/api.js';
import { PairedVerse, TextOverlay } from '../types/index.js';

export const VersePosterCreatorPage: React.FC = () => {
  // Option Mode: 'english' | 'tamil' | 'bilingual'
  const [posterMode, setPosterMode] = useState<'english' | 'tamil' | 'bilingual'>('bilingual');
  const [layoutStyle, setLayoutStyle] = useState<'classic_centered' | 'intimate_embrace'>('classic_centered');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | '9:16'>('4:5');
  const [selectedTopic, setSelectedTopic] = useState('faith');

  // Top Header / Hook
  const [showHeader, setShowHeader] = useState(true);
  const [headerText, setHeaderText] = useState('— HOLY BIBLE VERSE —');
  const [subtitleHook, setSubtitleHook] = useState('always with me');

  // Active Scripture Content
  const [currentVerse, setCurrentVerse] = useState<PairedVerse | null>(null);
  const [englishHighlight, setEnglishHighlight] = useState('BLESSED BE THE LORD GOD OF ISRAEL');
  const [englishText, setEnglishText] = useState(', which spake with his mouth unto David my father, and hath with his hand fulfilled it, saying,');
  const [dividerText, setDividerText] = useState('—  ❖  ⚜  ❖  —');
  const [tamilHighlight, setTamilHighlight] = useState('இஸ்ரவேலின் தேவனாகிய கர்த்தருக்கு ஸ்தோத்திரம்;');
  const [tamilText, setTamilText] = useState(' அவர் என் தகப்பனாகிய தாவீதோடே தம்முடைய வாயினால் சொன்னதை, தம்முடைய கையினால் நிறைவேற்றினார்; அவர் சொன்னது என்னவென்றால்:');
  const [dualReference, setDualReference] = useState('1 KINGS 8:15  |  1 இராஜாக்கள் 8:15');
  const [isVerified, setIsVerified] = useState(true);

  // Background Style
  const [bgPreset, setBgPreset] = useState('solomon_temple');
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  // AI DALL-E 3 Image Generator
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Photorealistic 8K cinematic photograph of Jesus Christ with a gentle, loving expression in a textured linen tunic, tenderly embracing a young believer from behind, resting His head close with deep comfort. Golden hour sunset rim-lighting from upper left, dark chiaroscuro shadows on the right with negative space for text overlays, 8k');
  const [showAIPanel, setShowAIPanel] = useState(false);

  // AI Devotional Caption
  const [devotionalCaption, setDevotionalCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Sample 1: King Solomon Temple
  const loadSolomonSample = () => {
    setLayoutStyle('classic_centered');
    setPosterMode('bilingual');
    setBgPreset('solomon_temple');
    setCustomBgUrl(null);
    setShowHeader(true);
    setHeaderText('— HOLY BIBLE VERSE —');
    setSubtitleHook('');
    setEnglishHighlight('BLESSED BE THE LORD GOD OF ISRAEL');
    setEnglishText(', which spake with his mouth unto David my father, and hath with his hand fulfilled it, saying,');
    setDividerText('—  ❖  ⚜  ❖  —');
    setTamilHighlight('இஸ்ரவேலின் தேவனாகிய கர்த்தருக்கு ஸ்தோத்திரம்;');
    setTamilText(' அவர் என் தகப்பனாகிய தாவீதோடே தம்முடைய வாயினால் சொன்னதை, தம்முடைய கையினால் நிறைவேற்றினார்; அவர் சொன்னது என்னவென்றால்:');
    setDualReference('1 KINGS 8:15  |  1 இராஜாக்கள் 8:15');
    setIsVerified(true);
  };

  // Sample 2: Intimate Jesus Embrace (The newly uploaded style)
  const loadJesusEmbraceSample = () => {
    setLayoutStyle('intimate_embrace');
    setPosterMode('english');
    setBgPreset('jesus_embrace');
    setCustomBgUrl(null);
    setShowHeader(true);
    setHeaderText('I know you');
    setSubtitleHook('always with me');
    setEnglishHighlight('Blessed be the LORD\nGod of Israel,');
    setEnglishText('which spake with his mouth\nunto David my father,\nand hath with his hand\nfulfilled it, saying,');
    setDividerText('—  ✝  —');
    setDualReference('1 KINGS 8:15');
    setIsVerified(true);
  };

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
    const eng = verse.english.text;
    const tam = verse.tamil.text;

    // Intelligent split of first phrase for glowing gold emphasis
    const engParts = eng.split(/[,.;:]/);
    if (engParts.length > 1 && engParts[0].length < 45) {
      setEnglishHighlight(engParts[0].toUpperCase());
      setEnglishText(eng.substring(engParts[0].length));
    } else {
      setEnglishHighlight('');
      setEnglishText(eng);
    }

    const tamParts = tam.split(/[,.;:]/);
    if (tamParts.length > 1 && tamParts[0].length < 55) {
      setTamilHighlight(tamParts[0] + ';');
      setTamilText(tam.substring(tamParts[0].length + 1));
    } else {
      setTamilHighlight('');
      setTamilText(tam);
    }

    setDualReference(`${verse.reference}  |  ${verse.book} ${verse.chapter}:${verse.verseStart}`);
    setIsVerified(verse.isVerified);
  };

  // Generate Devotional Reflection
  const handleGenerateCaption = async () => {
    try {
      setIsGeneratingCaption(true);
      const textToReflect = posterMode === 'tamil' ? (tamilHighlight + ' ' + tamilText) : (englishHighlight + ' ' + englishText);
      const res = await api.generateVerseCaption({
        verseReference: dualReference,
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

  // Generate AI Background via DALL-E 3
  const handleGenerateAIBackground = async (promptToUse?: string) => {
    const activePrompt = promptToUse || aiPrompt;
    if (!activePrompt.trim()) return;

    try {
      setIsGeneratingAI(true);
      const res = await api.generateImage(activePrompt, aspectRatio, 'spiritual_background');
      if (res.imageUrl) {
        setCustomBgUrl(res.imageUrl);
        setBgPreset('custom');
        alert('✨ DALL-E 3 Photorealistic Biblical background generated and applied!');
      } else if (res.presetFallback) {
        setBgPreset(res.preset || 'jesus_embrace');
        setCustomBgUrl(null);
        alert('Studio preset background applied: ' + (res.message || 'Ready!'));
      }
    } catch (err: any) {
      alert('AI Generation note: ' + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Build Dynamic Typography Layers based on Layout Style and Language Mode
  const buildTextOverlays = (): TextOverlay[] => {
    const overlays: TextOverlay[] = [];

    // STYLE 2: INTIMATE EMBRACE (Right-Side Negative Space Layout)
    if (layoutStyle === 'intimate_embrace') {
      // 1. Top Hook Roman Gold Serif
      if (showHeader && headerText.trim()) {
        overlays.push({
          id: 'embrace_hook1',
          text: headerText,
          x: 74,
          y: 14,
          fontSize: 34,
          fontFamily: "'Cinzel', Georgia, serif",
          color: '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      // 2. Flowing Cursive Script Accent
      if (subtitleHook.trim()) {
        overlays.push({
          id: 'embrace_hook2',
          text: subtitleHook,
          x: 74,
          y: 20,
          fontSize: 24,
          fontFamily: "'Brush Script MT', 'Dancing Script', 'Playfair Display', cursive, serif",
          color: '#FFFFFF',
          fontWeight: '400',
          align: 'center',
          shadow: true
        });
      }

      // 3. Subtle Underline Swoosh
      overlays.push({
        id: 'embrace_swoosh',
        text: '⎯⎯⎯⎯⎯⎯',
        x: 74,
        y: 23,
        fontSize: 14,
        fontFamily: "'Inter', sans-serif",
        color: '#D4AF37',
        fontWeight: 'bold',
        align: 'center',
        shadow: true
      });

      // 4. Lead text
      overlays.push({
        id: 'embrace_lead',
        text: 'And he said,',
        x: 74,
        y: 52,
        fontSize: 18,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      // 5. Golden Highlight Phrase
      if (englishHighlight.trim()) {
        overlays.push({
          id: 'embrace_highlight',
          text: englishHighlight,
          x: 74,
          y: 56,
          fontSize: 21,
          fontFamily: "'Cinzel', Georgia, serif",
          color: '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      // 6. Scripture Body
      overlays.push({
        id: 'embrace_body',
        text: englishText.trim(),
        x: 74,
        y: 65,
        fontSize: 17,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      // 7. Divider: Cross
      if (dividerText.trim()) {
        overlays.push({
          id: 'embrace_divider',
          text: dividerText,
          x: 74,
          y: 77,
          fontSize: 16,
          fontFamily: "'Inter', sans-serif",
          color: '#D4AF37',
          fontWeight: 'bold',
          align: 'center',
          shadow: true
        });
      }

      // 8. Reference
      overlays.push({
        id: 'embrace_ref',
        text: dualReference.includes('|') ? dualReference.split('|')[0].trim() : dualReference,
        x: 74,
        y: 82,
        fontSize: 18,
        fontFamily: "'Cinzel', 'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '800',
        align: 'center',
        shadow: true,
        letterSpacing: 2
      });

      return overlays;
    }

    // STYLE 1: CLASSIC CENTERED (Full-Width / Solomon Temple Layout)
    if (showHeader && headerText.trim()) {
      overlays.push({
        id: 'header',
        text: headerText,
        x: 50,
        y: 10,
        fontSize: 18,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true,
        letterSpacing: 3
      });
    }

    if (posterMode === 'english') {
      if (englishHighlight.trim()) {
        overlays.push({
          id: 'eng_highlight',
          text: englishHighlight,
          x: 50,
          y: 28,
          fontSize: 28,
          fontFamily: "'Cinzel', Georgia, serif",
          color: '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'eng_text',
        text: englishText.trim(),
        x: 50,
        y: englishHighlight.trim() ? 37 : 32,
        fontSize: 24,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      if (dividerText.trim()) {
        overlays.push({
          id: 'divider',
          text: dividerText,
          x: 50,
          y: 56,
          fontSize: 18,
          fontFamily: "'Inter', sans-serif",
          color: '#D4AF37',
          fontWeight: 'bold',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'ref',
        text: dualReference.includes('|') ? dualReference.split('|')[0].trim() : dualReference,
        x: 50,
        y: 74,
        fontSize: 22,
        fontFamily: "'Cinzel', 'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true
      });

    } else if (posterMode === 'tamil') {
      if (tamilHighlight.trim()) {
        overlays.push({
          id: 'tam_highlight',
          text: tamilHighlight,
          x: 50,
          y: 28,
          fontSize: 26,
          fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
          color: '#E6CA65',
          fontWeight: '700',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'tam_text',
        text: tamilText.trim(),
        x: 50,
        y: tamilHighlight.trim() ? 38 : 32,
        fontSize: 23,
        fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      if (dividerText.trim()) {
        overlays.push({
          id: 'divider',
          text: dividerText,
          x: 50,
          y: 58,
          fontSize: 18,
          fontFamily: "'Inter', sans-serif",
          color: '#D4AF37',
          fontWeight: 'bold',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'ref',
        text: dualReference.includes('|') ? dualReference.split('|')[1].trim() : dualReference,
        x: 50,
        y: 74,
        fontSize: 22,
        fontFamily: "'Noto Sans Tamil', 'Inter', sans-serif",
        color: '#E6CA65',
        fontWeight: '700',
        align: 'center',
        shadow: true
      });

    } else {
      // Bilingual English + Tamil
      if (englishHighlight.trim()) {
        overlays.push({
          id: 'eng_highlight',
          text: englishHighlight,
          x: 50,
          y: 19,
          fontSize: 22,
          fontFamily: "'Cinzel', Georgia, serif",
          color: '#E6CA65',
          fontWeight: '800',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'eng_text',
        text: englishText.trim(),
        x: 50,
        y: englishHighlight.trim() ? 25 : 20,
        fontSize: 19,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      if (dividerText.trim()) {
        overlays.push({
          id: 'divider',
          text: dividerText,
          x: 50,
          y: 43,
          fontSize: 17,
          fontFamily: "'Inter', sans-serif",
          color: '#D4AF37',
          fontWeight: 'bold',
          align: 'center',
          shadow: true
        });
      }

      if (tamilHighlight.trim()) {
        overlays.push({
          id: 'tam_highlight',
          text: tamilHighlight,
          x: 50,
          y: 50,
          fontSize: 21,
          fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
          color: '#E6CA65',
          fontWeight: '700',
          align: 'center',
          shadow: true
        });
      }

      overlays.push({
        id: 'tam_text',
        text: tamilText.trim(),
        x: 50,
        y: tamilHighlight.trim() ? 56 : 51,
        fontSize: 18,
        fontFamily: "'Noto Sans Tamil', 'Mukta Malar', sans-serif",
        color: '#F4EBD9',
        fontWeight: '500',
        align: 'center',
        shadow: true
      });

      overlays.push({
        id: 'ref',
        text: dualReference,
        x: 50,
        y: 77,
        fontSize: 19,
        fontFamily: "'Cinzel', 'Noto Sans Tamil', sans-serif",
        color: '#E6CA65',
        fontWeight: '800',
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
        title: `Poster - ${dualReference}`,
        project_type: 'bible_poster',
        status: 'draft',
        input_data: {
          dualReference,
          englishHighlight,
          englishText,
          tamilHighlight,
          tamilText,
          dividerText,
          showHeader,
          headerText,
          subtitleHook,
          layoutStyle,
          topic: selectedTopic,
          posterMode
        },
        design_preferences: {
          aspectRatio,
          background: {
            type: customBgUrl ? 'image' : 'preset',
            value: customBgUrl || bgPreset
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

  const aiPresets = [
    { label: "🕊 Jesus Embrace & Golden Glow", prompt: "Photorealistic 8K cinematic photograph of Jesus Christ with a gentle, loving expression in a textured linen tunic, tenderly embracing a young believer from behind, resting His head close with deep comfort and compassion. Intense golden hour sunset rim-lighting from the upper left casting a warm heavenly glow and halo on their hair and silhouettes. Deep dark moody chiaroscuro atmospheric shadows occupying the entire right side of the frame with spacious negative space for text overlays. Golden volumetric dust motes, warm 2800K cinematic color grading, hyper-detailed, Rembrandt lighting, zero text, no letters, no words, no watermarks, vertical 4:5 aspect ratio." },
    { label: "👑 Solomon's Temple & God Rays", prompt: "King Solomon holy temple with towering stone pillars, heavenly golden rays of light pouring from above, ancient golden crown on royal blue velvet cloth, cinematic 8k" },
    { label: "🌄 Mount Sinai Sunset & Tablets", prompt: "Mount Sinai at sunset with burning golden clouds, sacred mountain peak, rays of divine light, ancient biblical atmosphere, photorealistic" },
    { label: "🌿 Gethsemane Olive Trees", prompt: "Garden of Gethsemane ancient olive trees with peaceful golden morning light and heavenly misty atmosphere, 8K hyper-detailed" },
    { label: "✨ Heavenly Throne Room", prompt: "Celestial heavenly palace hall with glowing golden light rays, crystal floor reflections, majestic divine presence, pure majestic scene" },
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gold-600/10 border border-gold-500/30 text-gold-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold font-cinzel text-white">Bible Verse Poster Creator</h1>
              <p className="text-xs text-slate-400">
                Photorealistic AI Biblical Vistas & Deterministic Multilingual Typography
              </p>
            </div>
          </div>

          {/* Quick Style Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadJesusEmbraceSample}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-md ${
                bgPreset === 'jesus_embrace'
                  ? 'bg-gold-500/25 border-gold-400 text-gold-300 ring-1 ring-gold-400'
                  : 'bg-navy-900 border-navy-700 text-slate-300 hover:border-gold-500'
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-gold-400" />
              <span>🕊 Jesus' Embrace Style</span>
            </button>

            <button
              onClick={loadSolomonSample}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-md ${
                bgPreset === 'solomon_temple'
                  ? 'bg-gold-500/25 border-gold-400 text-gold-300 ring-1 ring-gold-400'
                  : 'bg-navy-900 border-navy-700 text-slate-300 hover:border-gold-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>👑 Solomon Temple Style</span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-900 border border-navy-700 hover:border-gold-500 text-slate-200 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-gold-400" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* LAYOUT ALIGNMENT PRESET */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gold-400">
                Composition Style
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setLayoutStyle('intimate_embrace');
                    if (bgPreset === 'solomon_temple') setBgPreset('jesus_embrace');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    layoutStyle === 'intimate_embrace'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  🕊 Intimate Embrace<br/>
                  <span className="text-[10px] font-normal text-slate-400">Right negative space typography</span>
                </button>

                <button
                  onClick={() => {
                    setLayoutStyle('classic_centered');
                    if (bgPreset === 'jesus_embrace') setBgPreset('solomon_temple');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                    layoutStyle === 'classic_centered'
                      ? 'border-gold-500 bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/40'
                      : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                  }`}
                >
                  👑 Classic Centered<br/>
                  <span className="text-[10px] font-normal text-slate-400">Centered full-width layout</span>
                </button>
              </div>

              {layoutStyle === 'classic_centered' && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy-800">
                  <button
                    onClick={() => setPosterMode('english')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                      posterMode === 'english'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                        : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>

                  <button
                    onClick={() => setPosterMode('tamil')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                      posterMode === 'tamil'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                        : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Tamil
                  </button>

                  <button
                    onClick={() => setPosterMode('bilingual')}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all ${
                      posterMode === 'bilingual'
                        ? 'border-gold-500 bg-gold-500/15 text-gold-300'
                        : 'border-navy-700 bg-navy-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    Bilingual
                  </button>
                </div>
              )}
            </div>

            {/* AI BACKGROUND GENERATOR (DALL-E 3) */}
            <div className="bg-gradient-to-br from-navy-900 to-navy-950 border border-gold-500/30 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wand2 className="w-4 h-4 text-gold-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Biblical Vista (DALL-E 3)
                  </span>
                </div>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="text-xs text-gold-400 hover:text-gold-300 underline cursor-pointer"
                >
                  {showAIPanel ? 'Collapse' : 'Customize Prompt'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {aiPresets.slice(0, 2).map((p, idx) => (
                  <button
                    key={idx}
                    disabled={isGeneratingAI}
                    onClick={() => handleGenerateAIBackground(p.prompt)}
                    className="p-2 rounded-xl bg-navy-950 border border-navy-700 hover:border-gold-500 text-left text-[11px] text-slate-300 hover:text-gold-300 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{p.label}</span>
                    <Sparkles className="w-3 h-3 text-gold-400 flex-shrink-0 ml-1" />
                  </button>
                ))}
              </div>

              {showAIPanel && (
                <div className="space-y-2 pt-2 border-t border-navy-800">
                  <label className="text-[11px] text-slate-400">Custom Scene Description:</label>
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-gold-500"
                    placeholder="E.g. Jesus embracing a believer with golden hour rim light..."
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {aiPresets.slice(2).map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAiPrompt(p.prompt);
                          handleGenerateAIBackground(p.prompt);
                        }}
                        className="text-[10px] bg-navy-800/80 hover:bg-gold-500/20 text-slate-300 hover:text-gold-300 px-2 py-1 rounded border border-navy-700"
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleGenerateAIBackground()}
                    disabled={isGeneratingAI}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Rendering 8K Vista with OpenAI DALL-E 3...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Generate 8K Scene with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SCRIPTURE HIERARCHY & STYLING */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Scripture Content & Typography
                </label>
                <button
                  onClick={() => loadVerseByTopic(selectedTopic)}
                  className="flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 bg-gold-500/10 px-2 py-1 rounded-lg border border-gold-500/30"
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  <span>Random Canonical Verse</span>
                </button>
              </div>

              {/* Topic Select */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Topic</label>
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
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Divider Style</label>
                  <select
                    value={dividerText}
                    onChange={(e) => setDividerText(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="—  ✝  —">—  ✝  — (Sample 2)</option>
                    <option value="—  ❖  ⚜  ❖  —">—  ❖  ⚜  ❖  — (Sample 1)</option>
                    <option value="—  ✦  ⚜  ✦  —">—  ✦  ⚜  ✦  —</option>
                    <option value="❖  ❖  ❖">❖  ❖  ❖</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              {/* Top Header / Hook Inputs */}
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gold-400">Top Header / Main Hook</label>
                  <input
                    type="checkbox"
                    checked={showHeader}
                    onChange={(e) => setShowHeader(e.target.checked)}
                    className="rounded border-navy-700 text-gold-500 focus:ring-gold-500"
                  />
                </div>
                {showHeader && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-gold-300 font-serif text-center"
                      placeholder="e.g. I know you"
                    />
                    {layoutStyle === 'intimate_embrace' && (
                      <input
                        type="text"
                        value={subtitleHook}
                        onChange={(e) => setSubtitleHook(e.target.value)}
                        className="w-full bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 italic font-serif text-center"
                        placeholder="e.g. always with me"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* English Section */}
              <div className="space-y-2 p-3 bg-navy-950/80 rounded-xl border border-navy-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">English Scripture</span>
                  <span className="text-[10px] text-gold-400 font-mono">Highlight In Gold</span>
                </div>
                <input
                  type="text"
                  value={englishHighlight}
                  onChange={(e) => setEnglishHighlight(e.target.value)}
                  placeholder="Highlighted Phrase (Gold)..."
                  className="w-full bg-navy-900 border border-gold-500/30 rounded-lg px-2.5 py-1.5 text-xs text-gold-400 font-serif"
                />
                <textarea
                  rows={3}
                  value={englishText}
                  onChange={(e) => setEnglishText(e.target.value)}
                  placeholder="Body text (White)..."
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg p-2 text-xs text-slate-200 font-serif leading-relaxed"
                />
              </div>

              {/* Tamil Section (if in bilingual or tamil mode) */}
              {layoutStyle === 'classic_centered' && (posterMode === 'tamil' || posterMode === 'bilingual') && (
                <div className="space-y-2 p-3 bg-navy-950/80 rounded-xl border border-navy-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Tamil Scripture (BSI Union)</span>
                    <span className="text-[10px] text-gold-400 font-mono">Highlight In Gold</span>
                  </div>
                  <input
                    type="text"
                    value={tamilHighlight}
                    onChange={(e) => setTamilHighlight(e.target.value)}
                    placeholder="Highlighted Phrase (Gold)..."
                    className="w-full bg-navy-900 border border-gold-500/30 rounded-lg px-2.5 py-1.5 text-xs text-gold-400 font-tamil"
                  />
                  <textarea
                    rows={2}
                    value={tamilText}
                    onChange={(e) => setTamilText(e.target.value)}
                    placeholder="Body text (White)..."
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg p-2 text-xs text-slate-200 font-tamil leading-relaxed"
                  />
                </div>
              )}

              {/* Dual Reference */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Bible Reference Line</label>
                <input
                  type="text"
                  value={dualReference}
                  onChange={(e) => setDualReference(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-gold-400 font-bold text-center"
                  placeholder="1 KINGS 8:15"
                />
              </div>
            </div>

            {/* BACKGROUND PRESETS & ASPECT RATIOS */}
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div>
                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Poster Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '4:5', label: '4:5 Portrait (Sample)' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '9:16', label: '9:16 Story / Reel' },
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white uppercase tracking-wider">
                    Background Theme Preset
                  </label>
                  {customBgUrl && (
                    <button
                      onClick={() => {
                        setCustomBgUrl(null);
                        setBgPreset('jesus_embrace');
                      }}
                      className="text-[10px] text-gold-400 underline"
                    >
                      Reset to Sample
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'jesus_embrace', label: "🕊 Jesus' Embrace (Sample 2)" },
                    { id: 'solomon_temple', label: "👑 Solomon's Temple (Sample 1)" },
                    { id: 'heavenly_gold', label: '✨ Heavenly Golden Light' },
                    { id: 'deep_navy_gold', label: '🌌 Deep Navy & Gold' },
                    { id: 'sunrise_mountains', label: '🌄 Sunrise Mountains' },
                    { id: 'starry_night', label: '⭐ Starry Night Sky' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setBgPreset(style.id);
                        setCustomBgUrl(null);
                        if (style.id === 'jesus_embrace') setLayoutStyle('intimate_embrace');
                        else if (style.id === 'solomon_temple') setLayoutStyle('classic_centered');
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        !customBgUrl && bgPreset === style.id
                          ? 'border-gold-500 bg-gold-500/15 text-gold-300 font-bold ring-1 ring-gold-500/40'
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
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-navy-800">
                    <span>Ready for Instagram / Facebook:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${devotionalCaption}\n\n${dualReference}\n\n${hashtags.join(' ')}`);
                        setCopiedCaption(true);
                        setTimeout(() => setCopiedCaption(false), 2000);
                      }}
                      className="text-gold-400 hover:text-gold-300 flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                      <span>{copiedCaption ? 'Copied!' : 'Copy All'}</span>
                    </button>
                  </div>
                  <p className="text-slate-200 leading-relaxed italic">"{devotionalCaption}"</p>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-gold-400 font-mono">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Click "Generate Caption" to create an inspiring devotional reflection and hashtags to accompany your poster on Instagram & social media.
                </p>
              )}
            </div>
          </div>

          {/* Live Canvas Preview Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full bg-navy-900/60 border border-navy-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center sticky top-6">
              <CanvasPreview
                type="bible_poster"
                aspectRatio={aspectRatio}
                title={`Bible Poster - ${dualReference}`}
                background={{
                  type: customBgUrl ? 'image' : 'preset',
                  value: customBgUrl || bgPreset
                }}
                texts={textOverlays}
                images={[]}
              />

              <div className="w-full mt-4 p-3 bg-navy-950/80 rounded-xl border border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pixel-Perfect SVG Composition & Sharp Native PNG rendering</span>
                </span>
                <span className="text-[11px] text-gold-400">Dual Style Support (Embrace + Solomon)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};