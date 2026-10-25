import { ImageCompositionService } from './imageCompositionService.js';
import { VerseService } from './verseService.js';
import { getSupabaseAdmin } from './supabaseService.js';
import { config } from '../config/index.js';

export interface InstagramPublishOptions {
  imageUrl: string;
  caption: string;
  igUserId: string;
  accessToken: string;
}

export interface InstagramPublishResult {
  success: boolean;
  mediaId?: string;
  permalink?: string;
  error?: string;
}

export class InstagramService {
  private static readonly GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

  /**
   * Publishes an image to an Instagram Professional/Business account via Instagram Graph API.
   * Step 1: Create Media Container
   * Step 2: Publish Container
   */
  static async publishPhoto(options: InstagramPublishOptions): Promise<InstagramPublishResult> {
    const { imageUrl, caption, igUserId, accessToken } = options;

    if (!igUserId || !accessToken) {
      throw new Error('Instagram User ID and Access Token are required for publishing.');
    }

    try {
      // 1. Create Media Container
      const createContainerUrl = `${this.GRAPH_API_BASE}/${igUserId}/media`;
      const containerParams = new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      });

      const containerRes = await fetch(`${createContainerUrl}?${containerParams.toString()}`, {
        method: 'POST'
      });

      const containerData = await containerRes.json() as any;

      if (!containerRes.ok || !containerData.id) {
        throw new Error(containerData.error?.message || 'Failed to create Instagram media container.');
      }

      const creationId = containerData.id;

      // Small delay for Meta CDN to ingest the image container
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Publish the Container
      const publishUrl = `${this.GRAPH_API_BASE}/${igUserId}/media_publish`;
      const publishParams = new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken
      });

      const publishRes = await fetch(`${publishUrl}?${publishParams.toString()}`, {
        method: 'POST'
      });

      const publishData = await publishRes.json() as any;

      if (!publishRes.ok || !publishData.id) {
        throw new Error(publishData.error?.message || 'Failed to publish Instagram media container.');
      }

      return {
        success: true,
        mediaId: publishData.id
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Automates the full end-to-end daily post:
   * 1. Picks a verified canonical scripture
   * 2. Composes a high-res 4:5 Instagram Portrait poster using Sharp
   * 3. Uploads the image to Supabase Storage
   * 4. Publishes to Instagram with devotional caption and hashtags
   */
  static async executeDailyPost(igUserId: string, accessToken: string, languageMode: 'english' | 'tamil' | 'bilingual' = 'bilingual') {
    // 1. Select random verified scripture
    const verse = await VerseService.getRandomVerse();

    // 2. Build typography overlays
    const texts: any[] = [];
    if (languageMode === 'english' || languageMode === 'bilingual') {
      texts.push({
        id: 'eng',
        text: `"${verse.english.text}"`,
        x: 50,
        y: 28,
        fontSize: 26,
        fontFamily: "'Cinzel', Georgia, serif",
        color: '#FFFFFF',
        align: 'center',
        shadow: true
      });
    }

    if (languageMode === 'bilingual') {
      texts.push({
        id: 'div',
        text: '❖  ❖  ❖',
        x: 50,
        y: 48,
        fontSize: 16,
        color: '#D4AF37',
        align: 'center',
        shadow: true
      });
    }

    if (languageMode === 'tamil' || languageMode === 'bilingual') {
      texts.push({
        id: 'tam',
        text: `"${verse.tamil.text}"`,
        x: 50,
        y: languageMode === 'tamil' ? 40 : 56,
        fontSize: 24,
        fontFamily: "'Noto Sans Tamil', sans-serif",
        color: '#F4EBD9',
        align: 'center',
        shadow: true
      });
    }

    texts.push({
      id: 'ref',
      text: `— ${verse.reference} —`,
      x: 50,
      y: 78,
      fontSize: 20,
      color: '#E6CA65',
      align: 'center',
      shadow: true
    });

    // 3. Render 4:5 high-res PNG (1080x1350)
    const imageBuffer = await ImageCompositionService.composeImage({
      type: 'bible_poster',
      aspectRatio: '4:5',
      background: {
        type: 'preset',
        value: 'heavenly_gold'
      },
      texts,
      images: []
    });

    // 4. Upload to Supabase Storage to get public HTTPS URL
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const fileName = `daily-auto/${Date.now()}-${verse.reference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const { error: uploadErr } = await supabase.storage
      .from(config.supabase.generatedBucket)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadErr) {
      throw uploadErr;
    }

    const { data: publicUrlData } = supabase.storage
      .from(config.supabase.generatedBucket)
      .getPublicUrl(fileName);

    const publicImageUrl = publicUrlData.publicUrl;

    // 5. Construct caption
    const caption = `✝ ${verse.reference}\n\n"${verse.english.text}"\n\n"${verse.tamil.text}"\n\nMay this Scripture bless your day and renew your strength in Christ. 🙏✨\n\n#BibleVerse #DailyScripture #FaithInGod #ScriptureOfTheDay #BibleVerseOfTheDay #TamilBibleVerse #JesusChrist #FaithCreatorStudio`;

    // 6. Publish via Instagram Graph API
    return await this.publishPhoto({
      imageUrl: publicImageUrl,
      caption,
      igUserId,
      accessToken
    });
  }
}
