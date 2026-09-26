/**
 * Deterministic danger-sign detection rules.
 * Inspired by WHO IMNCI protocol for rural India.
 *
 * These run BEFORE any AI/LLM call — instant, offline-capable.
 * If any danger sign is matched, the system immediately shows an EMERGENCY alert.
 */

export interface DangerSign {
  keywords: string[];
  category: string;
  labelHindi: string;
  action: string;
}

export const DANGER_SIGNS: DangerSign[] = [
  {
    keywords: ['chest pain', 'seene mein dard', 'chaati mein dard', 'chhati dard'],
    category: 'Heart',
    labelHindi: 'छाती में दर्द',
    action: 'Call 108 ambulance. Go to nearest hospital immediately.',
  },
  {
    keywords: ['breathing difficulty', 'saans nahi aa rahi', 'dum ghut raha', 'saans phool rahi', 'breathless'],
    category: 'Breathing',
    labelHindi: 'सांस लेने में तकलीफ़',
    action: 'Keep patient sitting upright. Call 108 ambulance immediately.',
  },
  {
    keywords: ['unconscious', 'behosh', 'hosh nahi', 'not responding', 'unresponsive'],
    category: 'Consciousness',
    labelHindi: 'बेहोशी',
    action: 'Do not move patient. Call 108 ambulance immediately.',
  },
  {
    keywords: ['seizure', 'fits', 'daura', 'convulsion', 'mirgi'],
    category: 'Seizure',
    labelHindi: 'दौरा / मिर्गी',
    action: 'Clear area around patient. Do not put anything in mouth. Call 108.',
  },
  {
    keywords: ['heavy bleeding', 'bahut khoon', 'hemorrhage', 'khoon beh raha'],
    category: 'Bleeding',
    labelHindi: 'भारी रक्तस्राव',
    action: 'Apply pressure to wound with clean cloth. Call 108 ambulance.',
  },
  {
    keywords: ['unable to drink', 'pee nahi pa raha', 'kuch kha nahi sakta', 'cannot swallow'],
    category: 'Dehydration',
    labelHindi: 'कुछ खा/पी नहीं पा रहा',
    action: 'This is a danger sign especially in children. Go to health center now.',
  },
  {
    keywords: ['severe headache with blurred vision', 'tez sir dard', 'aankh se dikhai nahi', 'nazar dhundli'],
    category: 'High BP Emergency',
    labelHindi: 'तेज़ सिर दर्द और धुंधली नज़र',
    action: 'Could be very high blood pressure. Go to hospital immediately.',
  },
  {
    keywords: ['high fever baby', 'bachche ko tez bukhar', 'infant fever', 'newborn fever'],
    category: 'Child Emergency',
    labelHindi: 'शिशु को तेज़ बुखार',
    action: 'Newborn fever is a danger sign. Go to health center immediately.',
  },
];

export interface DangerCheckResult {
  isEmergency: boolean;
  matchedSigns: {
    keyword: string;
    category: string;
    labelHindi: string;
    action: string;
  }[];
}

/**
 * Check text for danger signs. Works offline.
 * Returns matched signs with actionable guidance.
 */
export function checkDangerSigns(text: string): DangerCheckResult {
  const lower = text.toLowerCase();
  const matched: DangerCheckResult['matchedSigns'] = [];
  const seenCategories = new Set<string>();

  for (const sign of DANGER_SIGNS) {
    if (seenCategories.has(sign.category)) continue;
    for (const keyword of sign.keywords) {
      if (lower.includes(keyword)) {
        matched.push({
          keyword,
          category: sign.category,
          labelHindi: sign.labelHindi,
          action: sign.action,
        });
        seenCategories.add(sign.category);
        break;
      }
    }
  }

  return { isEmergency: matched.length > 0, matchedSigns: matched };
}
