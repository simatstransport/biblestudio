import React, { useRef, useState, useEffect } from 'react';
import { Download, Eye, EyeOff, Sparkles, Move, RefreshCw } from 'lucide-react';
import { TextOverlay, ImageOverlay } from '../../types/index.js';
import { api } from '../../services/api.js';

interface CanvasPreviewProps {
  type: 'youtube_thumbnail' | 'bible_poster';
  aspectRatio: '16:9' | '4:5' | '1:1' | '9:16';
  title?: string;
  background: {
    type: 'color' | 'gradient' | 'image' | 'preset';
    value: string;
    overlayColor?: string;
    opacity?: number;
  };
  texts: TextOverlay[];
  images: ImageOverlay[];
  contactInfo?: {
    enabled: boolean;
    text?: string;
  };
  eventInfo?: {
    enabled: boolean;
    text?: string;
  };
  onTextUpdate?: (texts: TextOverlay[]) => void;
  onImageUpdate?: (images: ImageOverlay[]) => void;
  selectedTextId?: string | null;
  onSelectText?: (id: string | null) => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  type,
  aspectRatio,
  title = 'Untitled Design',
  background,
  texts,
  images,
  contactInfo,
  eventInfo,
  onTextUpdate,
  selectedTextId,
  onSelectText
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSafeGuides, setShowSafeGuides] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Compute container aspect ratio class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-video w-full max-w-4xl';
      case '4:5': return 'aspect-[4/5] w-full max-w-md';
      case '1:1': return 'aspect-square w-full max-w-lg';
      case '9:16': return 'aspect-[9/16] w-full max-w-sm';
      default: return 'aspect-video w-full max-w-4xl';
    }
  };

  // Get background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.type === 'color') {
      return { backgroundColor: background.value || '#0B132B' };
    }
    if (background.type === 'image' && background.value) {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    // Presets
    switch (background.value) {
      case 'heavenly_gold':
        return {
          background: 'radial-gradient(circle at 50% 30%, #FFE8A3 0%, #D4AF37 35%, #4A3B10 70%, #140E02 100%)'
        };
      case 'deep_navy_gold':
        return {
          background: 'radial-gradient(circle at 50% 50%, #1C2D4A 0%, #0B132B 60%, #050814 100%)'
        };
      case 'sunrise_mountains':
        return {
          background: 'linear-gradient(180deg, #FF7E5F 0%, #FEB47B 40%, #2C3E50 70%, #0A1118 100%)'
        };
      case 'starry_night':
        return {
          background: 'radial-gradient(circle at 50% 30%, #1B1F38 0%, #0D0E1A 50%, #05060A 100%)'
        };
      case 'cross_silhouette':
        return {
          background: 'radial-gradient(circle at 50% 40%, #E29578 0%, #8338EC 50%, #0F051D 100%)'
        };
      case 'cinematic_bold':
      default:
        return {
          background: 'linear-gradient(135deg, #FF416C 0%, #8A2387 50%, #1A0933 100%)'
        };
    }
  };

  const handleDownload = async () => {
    try {
      setIsRendering(true);
      const payload = {
        title,
        type,
        aspectRatio,
        background,
        texts,
        images,
        contactInfo,
        eventInfo
      };

      const res = await api.renderFinalImage(payload);
      if (res.dataUrl) {
        const link = document.createElement('a');
        link.href = res.dataUrl;
        link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'design'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      alert('Error rendering image: ' + err.message);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Toolbar */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSafeGuides(!showSafeGuides)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showSafeGuides 
                ? 'bg-gold-500/20 text-gold-400 border-gold-500/40' 
                : 'bg-navy-900 text-slate-400 border-navy-700 hover:text-white'
            }`}
          >
            {showSafeGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Safe Area Guides</span>
          </button>
          <span className="text-xs text-slate-400 bg-navy-900 px-2 py-1 rounded border border-navy-800">
            {aspectRatio} ({aspectRatio === '16:9' ? '1280×720' : aspectRatio === '4:5' ? '1080×1350' : '1080×1080'})
          </span>
        </div>

        <button
          onClick={handleDownload}
          disabled={isRendering}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 shadow-md shadow-gold-500/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isRendering ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Rendering Ultra-HD...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download High-Res PNG</span>
            </>
          )}
        </button>
      </div>

      {/* Main Canvas Container */}
      <div
        ref={containerRef}
        style={getBackgroundStyle()}
        className={`relative rounded-xl overflow-hidden shadow-2xl border border-navy-700 select-none ${getAspectClass()}`}
        onClick={() => onSelectText && onSelectText(null)}
      >
        {/* Safe-Area Guide Overlay */}
        {showSafeGuides && (
          <div className="absolute inset-0 pointer-events-none z-40 border-2 border-dashed border-gold-500/40 m-[5%] flex items-start justify-end p-2">
            <span className="text-[10px] text-gold-400/80 bg-navy-950/80 px-2 py-0.5 rounded font-mono">
              Safe Content Margin (5%)
            </span>
          </div>
        )}

        {/* Image Overlays (Subject, Logo) */}
        {images.map((img) => (
          <div
            key={img.id}
            style={{
              position: 'absolute',
              left: `${img.x}%`,
              top: `${img.y}%`,
              width: `${img.width}%`,
              height: `${img.height}%`,
              zIndex: img.type === 'logo' ? 25 : 10,
            }}
            className="pointer-events-none"
          >
            <img
              src={img.url}
              alt={img.type}
              className={`w-full h-full ${img.type === 'logo' ? 'object-contain' : 'object-cover drop-shadow-2xl'}`}
              style={{ borderRadius: img.borderRadius ? `${img.borderRadius}px` : undefined }}
            />
          </div>
        ))}

        {/* Text Overlays */}
        {texts.map((item) => {
          const isSelected = selectedTextId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectText) onSelectText(item.id);
              }}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                color: item.color || '#FFFFFF',
                fontSize: `${item.fontSize * 0.75}px`, // Scaled for preview viewport
                fontWeight: item.fontWeight || 'bold',
                fontFamily: item.fontFamily || "'Noto Sans Tamil', 'Inter', sans-serif",
                textAlign: item.align || 'left',
                transform: item.align === 'center' ? 'translateX(-50%)' : item.align === 'right' ? 'translateX(-100%)' : 'none',
                textShadow: item.shadow ? '0 4px 12px rgba(0,0,0,0.85)' : 'none',
                zIndex: 30,
              }}
              className={`cursor-pointer px-2 py-1 rounded transition-all leading-tight whitespace-pre-wrap ${
                isSelected ? 'ring-2 ring-gold-400 bg-navy-950/40' : 'hover:outline-dashed hover:outline-1 hover:outline-white/40'
              }`}
            >
              {item.text}
            </div>
          );
        })}

        {/* Event Info Badge */}
        {eventInfo?.enabled && eventInfo.text && (
          <div className="absolute bottom-[6%] left-[5%] z-30">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-gold-500/95 text-navy-950 font-bold text-xs shadow-lg">
              <span>📅</span>
              <span>{eventInfo.text}</span>
            </div>
          </div>
        )}

        {/* Contact Info Badge */}
        {contactInfo?.enabled && contactInfo.text && (
          <div className="absolute bottom-[6%] right-[5%] z-30">
            <span className="text-xs font-semibold text-slate-200 drop-shadow-md bg-navy-950/70 px-2.5 py-1 rounded">
              {contactInfo.text}
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        💡 Click any text element on the canvas or use the controls on the left to edit wording, font size, and colors.
      </p>
    </div>
  );
};
