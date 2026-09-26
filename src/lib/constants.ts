/**
 * Body regions for the interactive body map.
 * Each region has Hindi + English labels and common symptoms.
 */
export const BODY_REGIONS = [
  {
    id: 'head' as const,
    label: 'Head',
    labelHindi: 'सिर',
    icon: '🤕',
    symptoms: ['headache', 'dizziness', 'fever', 'blurred vision'],
    symptomsHindi: ['सिर दर्द', 'चक्कर', 'बुखार', 'धुंधली नज़र'],
  },
  {
    id: 'chest' as const,
    label: 'Chest',
    labelHindi: 'छाती',
    icon: '🫁',
    symptoms: ['chest pain', 'cough', 'breathing difficulty', 'palpitations'],
    symptomsHindi: ['छाती दर्द', 'खांसी', 'सांस तकलीफ़', 'धड़कन तेज़'],
  },
  {
    id: 'stomach' as const,
    label: 'Stomach',
    labelHindi: 'पेट',
    icon: '🤢',
    symptoms: ['stomach pain', 'diarrhea', 'vomiting', 'no appetite'],
    symptomsHindi: ['पेट दर्द', 'दस्त', 'उल्टी', 'भूख नहीं'],
  },
  {
    id: 'left-arm' as const,
    label: 'Left Arm',
    labelHindi: 'बायां हाथ',
    icon: '💪',
    symptoms: ['pain', 'weakness', 'swelling', 'numbness'],
    symptomsHindi: ['दर्द', 'कमज़ोरी', 'सूजन', 'सुन्नपन'],
  },
  {
    id: 'right-arm' as const,
    label: 'Right Arm',
    labelHindi: 'दायां हाथ',
    icon: '💪',
    symptoms: ['pain', 'weakness', 'swelling', 'numbness'],
    symptomsHindi: ['दर्द', 'कमज़ोरी', 'सूजन', 'सुन्नपन'],
  },
  {
    id: 'left-leg' as const,
    label: 'Left Leg',
    labelHindi: 'बायां पैर',
    icon: '🦵',
    symptoms: ['pain', 'swelling', 'unable to walk', 'injury'],
    symptomsHindi: ['दर्द', 'सूजन', 'चल नहीं पा रहा', 'चोट'],
  },
  {
    id: 'right-leg' as const,
    label: 'Right Leg',
    labelHindi: 'दायां पैर',
    icon: '🦵',
    symptoms: ['pain', 'swelling', 'unable to walk', 'injury'],
    symptomsHindi: ['दर्द', 'सूजन', 'चल नहीं पा रहा', 'चोट'],
  },
  {
    id: 'back' as const,
    label: 'Back',
    labelHindi: 'पीठ',
    icon: '🔙',
    symptoms: ['back pain', 'stiffness', 'spine pain'],
    symptomsHindi: ['पीठ दर्द', 'अकड़न', 'रीढ़ दर्द'],
  },
  {
    id: 'full-body' as const,
    label: 'Full Body',
    labelHindi: 'पूरा शरीर',
    icon: '🤒',
    symptoms: ['fever', 'weakness', 'body ache', 'tiredness', 'rash'],
    symptomsHindi: ['बुखार', 'कमज़ोरी', 'बदन दर्द', 'थकान', 'दाने'],
  },
] as const;

export type BodyRegionId = (typeof BODY_REGIONS)[number]['id'];

/** Risk level display configuration */
export const RISK_LEVEL_CONFIG = {
  RED: {
    label: 'EMERGENCY',
    labelHindi: 'आपातकाल',
    description: 'Go to hospital immediately',
    descriptionHindi: 'तुरंत अस्पताल जाएं',
    bgColor: 'bg-danger-600',
    textColor: 'text-white',
    borderColor: 'border-danger-600',
    lightBg: 'bg-danger-50',
    icon: '🚨',
  },
  YELLOW: {
    label: 'NEEDS ATTENTION',
    labelHindi: 'ध्यान दें',
    description: 'Visit health center within 1-2 days',
    descriptionHindi: 'स्वास्थ्य केंद्र जाएं (1-2 दिन में)',
    bgColor: 'bg-warning-500',
    textColor: 'text-black',
    borderColor: 'border-warning-500',
    lightBg: 'bg-warning-50',
    icon: '⚠️',
  },
  GREEN: {
    label: 'HOME CARE',
    labelHindi: 'घर पर देखभाल',
    description: 'Monitor at home, visit doctor if it gets worse',
    descriptionHindi: 'घर पर देखभाल करें, बिगड़ने पर डॉक्टर से मिलें',
    bgColor: 'bg-safe-600',
    textColor: 'text-white',
    borderColor: 'border-safe-600',
    lightBg: 'bg-safe-50',
    icon: '✅',
  },
} as const;

/** Wizard step labels */
export const STEPS = [
  { id: 'speak' as const, label: 'Speak', labelHindi: 'बोलें', icon: '🎤' },
  { id: 'scan' as const, label: 'Scan', labelHindi: 'स्कैन', icon: '📄' },
  { id: 'result' as const, label: 'Result', labelHindi: 'नतीजा', icon: '📋' },
] as const;
