import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ComposeOptions {
  type: 'youtube_thumbnail' | 'bible_poster';
  aspectRatio: '16:9' | '4:5' | '1:1' | '9:16';
  background: {
    type: 'color' | 'gradient' | 'image' | 'preset';
    value: string;
    overlayColor?: string;
    opacity?: number;
  };
  texts: Array<{
    id: string;
    text: string;
    x: number; // percentage (0-100) or pixel
    y: number; // percentage (0-100) or pixel
    fontSize: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string;
    align?: 'left' | 'center' | 'right';
    shadow?: boolean;
    stroke?: string;
    strokeWidth?: number;
    backgroundColor?: string;
  }>;
  images?: Array<{
    id: string;
    type: 'logo' | 'subject';
    buffer?: Buffer;
    url?: string;
    x: number; // percentage or pixels
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
    glow?: boolean;
  }>;
  contactInfo?: {
    enabled: boolean;
    text?: string;
  };
  eventInfo?: {
    enabled: boolean;
    text?: string;
  };
}

export class ImageCompositionService {
  /**
   * Returns standard canvas dimensions in pixels for the given aspect ratio.
   */
  static getDimensions(aspectRatio: '16:9' | '4:5' | '1:1' | '9:16'): { width: number; height: number } {
    switch (aspectRatio) {
      case '16:9':
        return { width: 1280, height: 720 };
      case '4:5':
        return { width: 1080, height: 1350 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '9:16':
        return { width: 1080, height: 1920 };
      default:
        return { width: 1280, height: 720 };
    }
  }

  /**
   * Generates a deterministic high-resolution SVG background buffer
   * based on preset spiritual and studio themes.
   */
  static createPresetBackground(preset: string, width: number, height: number): Buffer {
    let gradientSvg = '';

    switch (preset) {
      case 'solomon_temple':
      case 'heavenly_gold':
        gradientSvg = `
          <defs>
            <radialGradient id="grad" cx="50%" cy="25%" r="75%">
              <stop offset="0%" stop-color="#FFE8A3" />
              <stop offset="25%" stop-color="#D4AF37" />
              <stop offset="60%" stop-color="#3D2E0B" />
              <stop offset="100%" stop-color="#0B132B" />
            </radialGradient>
            <linearGradient id="ray" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stop-color="rgba(255, 248, 220, 0.45)" />
              <stop offset="100%" stop-color="rgba(212, 175, 55, 0)" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
          <polygon points="${width * 0.35},0 ${width * 0.65},0 ${width * 0.95},${height} ${width * 0.05},${height}" fill="url(#ray)" opacity="0.4" />
        `;
        break;

      case 'deep_navy_gold':
        gradientSvg = `
          <defs>
            <radialGradient id="grad" cx="50%" cy="45%" r="80%">
              <stop offset="0%" stop-color="#1C2D4A" />
              <stop offset="55%" stop-color="#0B132B" />
              <stop offset="100%" stop-color="#040711" />
            </radialGradient>
            <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C5A059" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#E6CA65" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
          <circle cx="${width * 0.85}" cy="${height * 0.2}" r="${width * 0.35}" fill="url(#goldAcc)" />
          <line x1="${width * 0.1}" y1="${height * 0.08}" x2="${width * 0.9}" y2="${height * 0.08}" stroke="#C5A059" stroke-width="2" opacity="0.4" />
          <line x1="${width * 0.1}" y1="${height * 0.92}" x2="${width * 0.9}" y2="${height * 0.92}" stroke="#C5A059" stroke-width="2" opacity="0.4" />
        `;
        break;

      case 'sunrise_mountains':
        gradientSvg = `
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FF7E5F" />
              <stop offset="35%" stop-color="#FEB47B" />
              <stop offset="70%" stop-color="#2C3E50" />
              <stop offset="100%" stop-color="#070D14" />
            </linearGradient>
            <radialGradient id="sun" cx="50%" cy="35%" r="30%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="50%" stop-color="#FFEAA7" />
              <stop offset="100%" stop-color="rgba(255, 234, 167, 0)" />
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
          <circle cx="${width * 0.5}" cy="${height * 0.35}" r="${width * 0.2}" fill="url(#sun)" opacity="0.85" />
          <polygon points="0,${height} ${width * 0.3},${height * 0.65} ${width * 0.65},${height} 0,${height}" fill="#16202C" opacity="0.85" />
          <polygon points="${width * 0.35},${height} ${width * 0.75},${height * 0.6} ${width},${height} ${width * 0.35},${height}" fill="#0D141C" />
        `;
        break;

      case 'starry_night':
        gradientSvg = `
          <defs>
            <radialGradient id="grad" cx="50%" cy="30%" r="80%">
              <stop offset="0%" stop-color="#1E2340" />
              <stop offset="50%" stop-color="#0E101D" />
              <stop offset="100%" stop-color="#05060A" />
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
          <circle cx="${width * 0.15}" cy="${height * 0.15}" r="2" fill="#FFFFFF" opacity="0.9" />
          <circle cx="${width * 0.35}" cy="${height * 0.08}" r="1.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="${width * 0.75}" cy="${height * 0.18}" r="2.5" fill="#FFE8A3" opacity="0.95" />
          <circle cx="${width * 0.88}" cy="${height * 0.06}" r="1.8" fill="#FFFFFF" opacity="0.8" />
          <circle cx="${width * 0.55}" cy="${height * 0.25}" r="1.5" fill="#FFFFFF" opacity="0.6" />
        `;
        break;

      case 'cinematic_bold':
      default:
        gradientSvg = `
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#141E30" />
              <stop offset="50%" stop-color="#243B55" />
              <stop offset="100%" stop-color="#0B0E14" />
            </linearGradient>
            <radialGradient id="glow" cx="80%" cy="20%" r="55%">
              <stop offset="0%" stop-color="#FF416C" stop-opacity="0.45" />
              <stop offset="50%" stop-color="#8A2387" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
          <rect width="${width}" height="${height}" fill="url(#glow)" />
        `;
        break;
    }

    const fullSvg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${gradientSvg}
      </svg>
    `;

    return Buffer.from(fullSvg);
  }

  /**
   * Helper to escape XML/SVG special characters safely.
   */
  private static escapeXml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Builds an SVG overlay buffer containing all deterministic typography,
   * safe margins, text alignment, and Tamil Unicode rendering.
   */
  static createTypographySvg(options: ComposeOptions, width: number, height: number): Buffer {
    const textElements: string[] = [];

    // Safe margins
    const marginX = width * 0.05;
    const marginY = height * 0.05;

    // For Bible Posters: Add natural top vignette scrim for crystal-clear readability
    let scrimSvg = '';
    if (options.type === 'bible_poster') {
      scrimSvg = `
        <defs>
          <linearGradient id="topPosterScrim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#050B18" stop-opacity="0.88" />
            <stop offset="50%" stop-color="#050B18" stop-opacity="0.75" />
            <stop offset="85%" stop-color="#050B18" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#050B18" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height * 0.72}" fill="url(#topPosterScrim)" />
      `;
    }

    for (const item of options.texts) {
      if (!item.text || !item.text.trim()) continue;

      const escaped = ImageCompositionService.escapeXml(item.text);
      const fontSize = Math.max(16, item.fontSize || 40);
      const color = item.color || '#FFFFFF';
      const fontWeight = item.fontWeight || 'bold';
      const fontFamily = item.fontFamily || "'Cinzel', 'Noto Sans Tamil', 'Inter', serif";

      // Calculate absolute coordinate
      const posX = item.x <= 100 ? (item.x / 100) * width : item.x;
      const posY = item.y <= 100 ? (item.y / 100) * height : item.y;

      let textAnchor = 'start';
      if (item.align === 'center') textAnchor = 'middle';
      else if (item.align === 'right') textAnchor = 'end';

      // Split multiline text
      const lines = escaped.split('\n');
      const lineHeight = fontSize * 1.35;

      const filterDef = item.shadow ? 'filter="url(#textShadow)"' : '';
      const strokeAttr = item.stroke ? `stroke="${item.stroke}" stroke-width="${item.strokeWidth || 4}" paint-order="stroke fill"` : '';

      const tspanLines = lines.map((line, idx) => {
        const dy = idx === 0 ? 0 : lineHeight;
        return `<tspan x="${posX}" dy="${dy}">${line}</tspan>`;
      }).join('');

      textElements.push(`
        <text 
          x="${posX}" 
          y="${posY}" 
          font-family="${fontFamily}" 
          font-size="${fontSize}px" 
          font-weight="${fontWeight}" 
          fill="${color}" 
          text-anchor="${textAnchor}"
          ${filterDef}
          ${strokeAttr}
        >
          ${tspanLines}
        </text>
      `);
    }

    // Optional Event info badge rendering
    if (options.eventInfo?.enabled && options.eventInfo.text) {
      const escapedEvent = ImageCompositionService.escapeXml(options.eventInfo.text);
      const badgeY = height - marginY - 45;
      textElements.push(`
        <g id="eventBadge">
          <rect x="${marginX}" y="${badgeY}" width="${Math.min(width * 0.6, 420)}" height="40" rx="8" fill="#D4AF37" fill-opacity="0.95" />
          <text x="${marginX + 15}" y="${badgeY + 26}" font-family="'Inter', sans-serif" font-size="18px" font-weight="bold" fill="#0B132B">
            📅 ${escapedEvent}
          </text>
        </g>
      `);
    }

    // Optional Contact info badge rendering
    if (options.contactInfo?.enabled && options.contactInfo.text) {
      const escapedContact = ImageCompositionService.escapeXml(options.contactInfo.text);
      const contactY = height - marginY - 10;
      textElements.push(`
        <g id="contactBadge">
          <text x="${width - marginX}" y="${contactY}" font-family="'Inter', sans-serif" font-size="16px" font-weight="600" fill="#E2E8F0" text-anchor="end" filter="url(#textShadow)">
            ${escapedContact}
          </text>
        </g>
      `);
    }

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="textShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.95"/>
          </filter>
        </defs>
        ${scrimSvg}
        ${textElements.join('\n')}
      </svg>
    `;

    return Buffer.from(svg);
  }

  /**
   * Orchestrates the complete composition pipeline using Sharp.
   */
  static async composeImage(options: ComposeOptions): Promise<Buffer> {
    const { width, height } = ImageCompositionService.getDimensions(options.aspectRatio);

    // 1. Prepare Base Background
    let baseSharp: sharp.Sharp;

    // Check if preset is solomon_temple or jesus_embrace
    const samplePresetPath = path.resolve(process.cwd(), 'client/public/presets/solomon_temple.jpg');
    const sampleAltPath = path.resolve(process.cwd(), '../client/public/presets/solomon_temple.jpg');
    const embracePresetPath = path.resolve(process.cwd(), 'client/public/presets/jesus_embrace.jpg');
    const embraceAltPath = path.resolve(process.cwd(), '../client/public/presets/jesus_embrace.jpg');

    if (options.background.value === 'jesus_embrace' && (fs.existsSync(embracePresetPath) || fs.existsSync(embraceAltPath))) {
      const activePath = fs.existsSync(embracePresetPath) ? embracePresetPath : embraceAltPath;
      baseSharp = sharp(activePath).resize(width, height, { fit: 'cover' });
    } else if (options.background.value === 'solomon_temple' && (fs.existsSync(samplePresetPath) || fs.existsSync(sampleAltPath))) {
      const activePath = fs.existsSync(samplePresetPath) ? samplePresetPath : sampleAltPath;
      baseSharp = sharp(activePath).resize(width, height, { fit: 'cover' });
    } else if (options.background.type === 'preset') {
      const presetBuffer = ImageCompositionService.createPresetBackground(options.background.value, width, height);
      baseSharp = sharp(presetBuffer);
    } else if (options.background.type === 'color') {
      baseSharp = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: options.background.value || '#0B132B'
        }
      });
    } else if (options.background.type === 'image' && options.background.value) {
      if (options.background.value.startsWith('http://') || options.background.value.startsWith('https://')) {
        // Fetch remote AI generated image (e.g. OpenAI DALL-E 3)
        try {
          const fetchRes = await fetch(options.background.value);
          const arrayBuf = await fetchRes.arrayBuffer();
          baseSharp = sharp(Buffer.from(arrayBuf)).resize(width, height, { fit: 'cover' });
        } catch {
          const presetBuffer = ImageCompositionService.createPresetBackground('heavenly_gold', width, height);
          baseSharp = sharp(presetBuffer);
        }
      } else if (options.background.value.startsWith('data:image')) {
        const base64Data = options.background.value.split(',')[1];
        const imgBuffer = Buffer.from(base64Data, 'base64');
        baseSharp = sharp(imgBuffer).resize(width, height, { fit: 'cover' });
      } else if (options.background.value.includes('jesus_embrace') && fs.existsSync(embracePresetPath)) {
        baseSharp = sharp(embracePresetPath).resize(width, height, { fit: 'cover' });
      } else if (options.background.value.includes('solomon_temple') && fs.existsSync(samplePresetPath)) {
        baseSharp = sharp(samplePresetPath).resize(width, height, { fit: 'cover' });
      } else {
        const presetBuffer = ImageCompositionService.createPresetBackground('deep_navy_gold', width, height);
        baseSharp = sharp(presetBuffer);
      }
    } else {
      const presetBuffer = ImageCompositionService.createPresetBackground('heavenly_gold', width, height);
      baseSharp = sharp(presetBuffer);
    }

    // 2. Prepare Compositing Overlays (Subject, Logo, Typography)
    const compositeList: sharp.OverlayOptions[] = [];

    // Composite Images (Logo, Subjects)
    if (options.images && options.images.length > 0) {
      for (const img of options.images) {
        if (!img.buffer && !img.url) continue;

        try {
          let imgBuf: Buffer;
          if (img.buffer) {
            imgBuf = img.buffer;
          } else if (img.url?.startsWith('http://') || img.url?.startsWith('https://')) {
            const r = await fetch(img.url);
            imgBuf = Buffer.from(await r.arrayBuffer());
          } else if (img.url?.startsWith('data:image')) {
            const b64 = img.url.split(',')[1];
            imgBuf = Buffer.from(b64, 'base64');
          } else {
            continue;
          }

          const targetWidth = Math.round(img.width <= 100 ? (img.width / 100) * width : img.width);
          const targetHeight = Math.round(img.height <= 100 ? (img.height / 100) * height : img.height);
          const targetX = Math.round(img.x <= 100 ? (img.x / 100) * width : img.x);
          const targetY = Math.round(img.y <= 100 ? (img.y / 100) * height : img.y);

          const resized = await sharp(imgBuf)
            .resize(targetWidth, targetHeight, { fit: img.type === 'logo' ? 'inside' : 'cover' })
            .toBuffer();

          compositeList.push({
            input: resized,
            left: Math.max(0, targetX),
            top: Math.max(0, targetY)
          });
        } catch (imgErr: any) {
          console.warn('Failed to composite image overlay:', imgErr.message);
        }
      }
    }

    // 3. Composite SVG Typography Overlay
    const typographySvg = ImageCompositionService.createTypographySvg(options, width, height);
    compositeList.push({
      input: typographySvg,
      left: 0,
      top: 0
    });

    // 4. Render Final Composite to PNG Buffer
    return await baseSharp
      .composite(compositeList)
      .png({ quality: 95, compressionLevel: 8 })
      .toBuffer();
  }
}
