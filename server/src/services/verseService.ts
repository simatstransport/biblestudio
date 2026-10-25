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

// Built-in verified canonical scripture dataset for offline/fast access
export const CANONICAL_VERSES: PairedVerse[] = [
  {
    reference: 'Hebrews 11:1',
    book: 'Hebrews',
    chapter: 11,
    verseStart: 1,
    topic: 'faith',
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
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verseStart: 11,
    topic: 'hope',
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
    reference: 'Romans 15:13',
    book: 'Romans',
    chapter: 15,
    verseStart: 13,
    topic: 'hope',
    english: {
      translation: 'KJV',
      text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'பரிசுத்த ஆவியின் பலத்தினாலே உங்களுக்கு நம்பிக்கை பெருகும்படிக்கு, நம்பிக்கையின் தேவன் விசுவாசத்தினால் உண்டாகும் எல்லாவித சந்தோஷத்தினாலும் சமாதானத்தினாலும் உங்களை நிரப்புவாராக.'
    },
    isVerified: true
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verseStart: 13,
    topic: 'strength',
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
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verseStart: 31,
    topic: 'strength',
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
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verseStart: 16,
    topic: 'love',
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
    reference: '1 Corinthians 13:13',
    book: '1 Corinthians',
    chapter: 13,
    verseStart: 13,
    topic: 'love',
    english: {
      translation: 'KJV',
      text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'இப்பொழுது விசுவாசம், நம்பிக்கை, அன்பு இந்த மூன்றும் நிலைத்திருக்கிறது; இவைகளில் அன்பே பெரியது.'
    },
    isVerified: true
  },
  {
    reference: 'Joshua 1:9',
    book: 'Joshua',
    chapter: 1,
    verseStart: 9,
    topic: 'promises',
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
    reference: 'Psalm 23:1',
    book: 'Psalm',
    chapter: 23,
    verseStart: 1,
    topic: 'protection',
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
    reference: 'Psalm 91:1-2',
    book: 'Psalm',
    chapter: 91,
    verseStart: 1,
    verseEnd: 2,
    topic: 'protection',
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
    reference: 'Matthew 11:28',
    book: 'Matthew',
    chapter: 11,
    verseStart: 28,
    topic: 'encouragement',
    english: {
      translation: 'KJV',
      text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.'
    },
    tamil: {
      translation: 'Tamil BSI',
      text: 'வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.'
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
}
