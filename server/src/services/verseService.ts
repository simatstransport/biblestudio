import { getSupabaseAdmin } from './supabaseService.js';

export interface VerseItem {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  translation: string;
  language: 'english' | 'tamil';
  topic: string;
  verseText: string;
  verificationStatus: 'verified' | 'unverified';
}

export interface PairedVerse {
  reference: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  topic: string;
  themeTitle?: string;
  suggestedAtmosphere?: string;
  suggestedVisualConcept?: string;
  english: {
    translation: string;
    text: string;
  };
  tamil: {
    translation: string;
    text: string;
  };
  isVerified: boolean;
}

// Built-in verified canonical scripture dataset with dynamic creative nuances
export const CANONICAL_VERSES: PairedVerse[] = [
  {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verseStart: 16,
    topic: 'love',
    themeTitle: "God's Boundless Love & Eternal Salvation",
    suggestedAtmosphere: "Sacrificial love, radiant hope, eternal grace, celestial warmth",
    suggestedVisualConcept: "Mount Calvary silhouette with the holy cross bathed in radiant dawn golden rays and ethereal morning clouds",
    english: {
      translation: 'KJV',
      text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'தேவன், தம்முடைய ஒரேபேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு, அவரைத் தந்தருளி, இவ்வளவாய் உலகத்தில் அன்புகூர்ந்தார்.'
    },
    isVerified: true
  },
  {
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verseStart: 28,
    topic: 'encouragement',
    themeTitle: "Divine Rest & Tender Compassion",
    suggestedAtmosphere: "Warm, peaceful, intimate divine presence, golden hour glow",
    suggestedVisualConcept: "Jesus embracing a young believer tenderly with golden backlight",
    english: {
      translation: 'KJV',
      text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.'
    },
    isVerified: true
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalm',
    chapter: 23,
    verseStart: 1,
    topic: 'protection',
    themeTitle: "The Lord My Shepherd & Restorer",
    suggestedAtmosphere: "Peaceful, tranquil, restoring, deep serene stillness",
    suggestedVisualConcept: "Gentle shepherd with flock beside tranquil still waters and lush green pastures under golden morning light",
    english: {
      translation: 'KJV',
      text: 'The LORD is my shepherd; I shall not want.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.'
    },
    isVerified: true
  },
  {
    reference: '1 Kings 8:15',
    book: '1 Kings',
    chapter: 8,
    verseStart: 15,
    topic: 'faithfulness',
    themeTitle: "Faithfulness & Sacred Covenant",
    suggestedAtmosphere: "Reverent awe, majestic, sacred temple worship",
    suggestedVisualConcept: "Ancient Solomon's temple stone colonnade with celestial sun rays breaking through incense mist",
    english: {
      translation: 'KJV',
      text: 'Blessed be the LORD God of Israel, which spake with his mouth unto David my father, and hath with his hand fulfilled it, saying,'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'அவர் என் தகப்பனாகிய தாவீதோடே தம்முடைய வாக்கினால் சொன்னதை தம்முடைய கரத்தினால் நிறைவேற்றி, சொல்லியதாவது: இஸ்ரவேலின் தேவனாகிய கர்த்தருக்கு ஸ்தோத்திரம்.'
    },
    isVerified: true
  },
  {
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verseStart: 11,
    topic: 'hope',
    themeTitle: "Hope, Divine Purpose & Expected End",
    suggestedAtmosphere: "Uplifting assurance, serene peace, bright horizon glow",
    suggestedVisualConcept: "Tranquil winding pathway opening toward a radiant sunrise over hills of promise",
    english: {
      translation: 'KJV',
      text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'நீங்கள் எதிர்பார்த்திருக்கும் முடிவை உங்களுக்குக் கொடுக்கும்படிக்கு நான் உங்களைக்குறித்து நினைத்திருக்கிற நினைவுகளை அறிவேன் என்று கர்த்தர் சொல்லுகிறார்; அவைகள் தீமைக்கல்ல, சமாதானத்துக்கேதுவான நினைவுகளே.'
    },
    isVerified: true
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verseStart: 13,
    topic: 'strength',
    themeTitle: "Strength & Triumph Through Christ",
    suggestedAtmosphere: "Empowering divine energy, soaring victory, celestial brilliance",
    suggestedVisualConcept: "Glorious golden eagle soaring above rugged mountain peaks bathed in brilliant sunrise",
    english: {
      translation: 'KJV',
      text: 'I can do all things through Christ which strengtheneth me.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.'
    },
    isVerified: true
  },
  {
    reference: 'Joshua 1:9',
    book: 'Joshua',
    chapter: 1,
    verseStart: 9,
    topic: 'promises',
    themeTitle: "Courage & Unshakeable Faith",
    suggestedAtmosphere: "Heroic faith, bold confidence, golden dawn strength",
    suggestedVisualConcept: "Majestic mountain summit breaking through parting clouds into radiant morning light",
    english: {
      translation: 'KJV',
      text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'நான் உனக்குக் கட்டளையிடவில்லையா? பலங்கொண்டு திடமனதாயிரு; திகையாதே, கலங்காதே, நீ போகும் இடமெல்லாம் உன் தேவனாகிய கர்த்தர் உன்னோடே இருக்கிறார் என்றார்.'
    },
    isVerified: true
  },
  {
    reference: 'Hebrews 11:1',
    book: 'Hebrews',
    chapter: 11,
    verseStart: 1,
    topic: 'faith',
    themeTitle: "Unseen Substance of Faith",
    suggestedAtmosphere: "Spiritual clarity, holy wonder, celestial beam piercing darkness",
    suggestedVisualConcept: "Single luminous golden ray illuminating an ancient open scroll amidst starlit skies",
    english: {
      translation: 'KJV',
      text: 'Now faith is the substance of things hoped for, the evidence of things not seen.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'விசுவாசமானது நம்பப்படுகிறவைகளின் உறுதியும், காணப்படாதவைகளின் நிச்சயமுமாயிருக்கிறது.'
    },
    isVerified: true
  },
  {
    reference: '2 Corinthians 5:7',
    book: '2 Corinthians',
    chapter: 5,
    verseStart: 7,
    topic: 'faith',
    themeTitle: "Walking by Faith, Not by Sight",
    suggestedAtmosphere: "Trusting peace, gentle twilight giving way to dawn",
    suggestedVisualConcept: "Steadfast footsteps on a glowing mountain ridge overlooking a cloud sea",
    english: {
      translation: 'KJV',
      text: 'For we walk by faith, not by sight.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'பார்வையினாலே நடவாமல், விசுவாசத்தினாலே நடக்கிறோம்.'
    },
    isVerified: true
  },
  {
    reference: 'Psalm 91:1-2',
    book: 'Psalm',
    chapter: 91,
    verseStart: 1,
    verseEnd: 2,
    topic: 'protection',
    themeTitle: "Under the Shadow of the Almighty",
    suggestedAtmosphere: "Invincible security, sacred peace, luminous golden aura",
    suggestedVisualConcept: "Ancient stone fortress perched high on a cliff enveloped in protective celestial light",
    english: {
      translation: 'KJV',
      text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'உன்னதமானவரின் மறைவிலிருக்கிறவன் சர்வவல்லவருடைய நிழலில் தங்குவான். நான் கர்த்தரை நோக்கி: நீர் என் அடைக்கலம், என் கோட்டை, என் தேவன், நான் நம்பியிருக்கிறவர் என்று சொல்லுவேன்.'
    },
    isVerified: true
  },
  {
    reference: 'Philippians 4:6-7',
    book: 'Philippians',
    chapter: 4,
    verseStart: 6,
    verseEnd: 7,
    topic: 'peace',
    themeTitle: "The Peace That Surpasses Understanding",
    suggestedAtmosphere: "Gentle stillness, calming tranquility, soft golden dusk",
    suggestedVisualConcept: "Quiet tranquil olive grove with soft radiant light filtering through gentle leaves",
    english: {
      translation: 'KJV',
      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'நீங்கள் ஒன்றுக்குங் கவலைப்படாமல், எல்லாவற்றையுங்குறித்து உங்கள் விண்ணப்பங்களை ஸ்தோத்திரத்தோடே கூடிய ஜெபத்தினாலும் வேண்டுதலினாலும் தேவனுக்குத் தெரியப்படுத்துங்கள். அப்பொழுது, எல்லாப் புத்திக்கும் மேலான தேவசமாதானம் உங்கள் இருதயங்களையும் உங்கள் சிந்தைகளையும் கிறிஸ்து இயேசுவுக்குள் காத்துக்கொள்ளும்.'
    },
    isVerified: true
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verseStart: 5,
    verseEnd: 6,
    topic: 'wisdom',
    themeTitle: "Trust in the Lord with All Your Heart",
    suggestedAtmosphere: "Serene guidance, clear path, bright horizon glow",
    suggestedVisualConcept: "A straight sunlit stone path cutting smoothly through an ancient forest toward radiant daylight",
    english: {
      translation: 'KJV',
      text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'உன் சுயபுத்தியின்மேல் சாயாமல், உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிருந்து, உன் வழிகளிலெல்லாம் அவரை நினைத்துக்கொள்; அப்பொழுது அவர் உன் பாதைகளைச் செவ்வைப்படுத்துவார்.'
    },
    isVerified: true
  },
  {
    reference: '1 Thessalonians 5:16-18',
    book: '1 Thessalonians',
    chapter: 5,
    verseStart: 16,
    verseEnd: 18,
    topic: 'gratitude',
    themeTitle: "Unceasing Joy & Gratitude",
    suggestedAtmosphere: "Joyful celebration, radiant thanksgiving, uplifting golden radiance",
    suggestedVisualConcept: "Sun-drenched wheat field at harvest dawn with golden light motes dancing in the air",
    english: {
      translation: 'KJV',
      text: 'Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'எப்பொழுதும் சந்தோஷமாயிருங்கள். இடைவிடாமல் ஜெபம்பண்ணுங்கள். எல்லாவற்றிலேயும் ஸ்தோத்திரஞ்செய்யுங்கள்; அப்படிச் செய்வதே கிறிஸ்து இயேசுவுக்குள் உங்களைக்குறித்து தேவனுடைய சித்தமாயிருக்கிறது.'
    },
    isVerified: true
  },
  {
    reference: 'Lamentations 3:22-23',
    book: 'Lamentations',
    chapter: 3,
    verseStart: 22,
    verseEnd: 23,
    topic: 'faithfulness',
    themeTitle: "New Mercies Every Morning",
    suggestedAtmosphere: "Fresh morning dew, pristine hope, gentle dawn illumination",
    suggestedVisualConcept: "Pristine mountain valley with morning dew glistening in the golden rays of a fresh sunrise",
    english: {
      translation: 'KJV',
      text: 'It is of the LORD\'s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'நாம் நிர்மூலமாகாதிருக்கிறது கர்த்தருடைய கிருபையே, அவருடைய இரக்கங்களுக்கு முடிவே இல்லை. அவைகள் காலைதோறும் புதியவைகள்; உமது உண்மை பெரிதாயிருக்கிறது.'
    },
    isVerified: true
  },
  {
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verseStart: 31,
    topic: 'strength',
    themeTitle: "Renewed Strength Like Eagles",
    suggestedAtmosphere: "Empowering soaring energy, dawn majesty, wind of the Spirit",
    suggestedVisualConcept: "Golden eagle ascending powerfully through mountain clouds toward the blazing morning sun",
    english: {
      translation: 'KJV',
      text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'கர்த்தருக்குக் காத்திருக்கிறவர்களோ புதுப்பெலன் அடைந்து, கழுகுகளைப்போலச் செட்டைகளை அடித்து எழும்புவார்கள்; அவர்கள் ஓடினாலும் இளைப்படையார்கள், நடந்தாலும் சோர்ந்துபோகார்கள்.'
    },
    isVerified: true
  },
  {
    reference: '1 Corinthians 13:13',
    book: '1 Corinthians',
    chapter: 13,
    verseStart: 13,
    topic: 'love',
    themeTitle: "Faith, Hope, and Love",
    suggestedAtmosphere: "Deep tender love, eternal warmth, golden celestial light",
    suggestedVisualConcept: "Warm radiant golden sunrise filling an expansive sky with beams of pure warmth",
    english: {
      translation: 'KJV',
      text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'இப்பொழுது விசுவாசம், நம்பிக்கை, அன்பு இந்த மூன்றும் நிலைத்திருக்கிறது; இவைகளில் அன்பே பெரியது.'
    },
    isVerified: true
  }
];

export class VerseService {
  /**
   * Retrieves paired verses filtered by topic, or all if topic is omitted.
   */
  static async getVersesByTopic(topic?: string): Promise<PairedVerse[]> {
    if (!topic || topic === 'all') {
      return CANONICAL_VERSES;
    }
    const cleanTopic = topic.toLowerCase().trim();
    return CANONICAL_VERSES.filter(v => v.topic.toLowerCase() === cleanTopic);
  }

  /**
   * Retrieves a random verified verse, optionally avoiding recently used references.
   */
  static async getRandomVerse(topic?: string, excludeReferences: string[] = []): Promise<PairedVerse> {
    const list = await VerseService.getVersesByTopic(topic);
    const candidates = list.filter(v => !excludeReferences.includes(v.reference));

    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      return candidates[idx];
    }

    const fallbackIdx = Math.floor(Math.random() * list.length);
    return list[fallbackIdx];
  }

  /**
   * Finds a verified verse by reference (e.g., 'Jeremiah 29:11').
   */
  static async findByReference(reference: string): Promise<PairedVerse | null> {
    const norm = reference.toLowerCase().replace(/\s+/g, '');
    const found = CANONICAL_VERSES.find(v => v.reference.toLowerCase().replace(/\s+/g, '') === norm);
    return found || null;
  }

  /**
   * Automatically detects and generates theme title, emotional atmosphere,
   * and visual concept preferences dynamically tailored to the specific scripture.
   */
  static detectNuances(reference: string, text?: string): {
    themeTitle: string;
    atmosphere: string;
    visualPreferences: string;
  } {
    // 1. Check known canonical verse matches
    const known = CANONICAL_VERSES.find(v => 
      v.reference.toLowerCase().replace(/\s+/g, '') === reference.toLowerCase().replace(/\s+/g, '')
    );
    if (known && known.themeTitle && known.suggestedAtmosphere && known.suggestedVisualConcept) {
      return {
        themeTitle: known.themeTitle,
        atmosphere: known.suggestedAtmosphere,
        visualPreferences: known.suggestedVisualConcept
      };
    }

    // 2. Intelligent keyword analysis on combined reference and verse text
    const combined = `${reference} ${text || ''}`.toLowerCase();

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

    // Default intelligent spiritual fallback
    return {
      themeTitle: "Divine Grace & Everlasting Promise",
      atmosphere: "Celestial warmth, peaceful reverent presence, golden dawn glow",
      visualPreferences: "Ethereal sunrise over biblical hills with glorious parting clouds and radiant divine light"
    };
  }
}
