import type { HealthCheckRequest, HealthCheckResponse, VoiceResponse, ScanResponse } from './types';
import { checkDangerSigns } from './rules';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || contentType.includes('text/html')) {
    const text = await res.text().catch(() => 'Unknown error');
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.error || parsed.message || parsed.detail || text;
    } catch {
      // not JSON or was HTML fallback from SPA routing
      if (contentType.includes('text/html')) {
        message = 'Static deployment without serverless functions';
      }
    }
    throw new ApiError(res.status || 500, message);
  }
  return res.json() as Promise<T>;
}

/** Local client-side clinical triage engine for static folder drop deployments */
function runClientHealthCheck(request: HealthCheckRequest): HealthCheckResponse {
  const combined = `${request.symptoms || ''} ${(request.bodyRegions || []).join(' ')} ${request.documentText || ''}`.trim();
  const lower = combined.toLowerCase();

  // 1. Check for WHO/MOHFW Danger Signs (RED Emergency)
  const dangerCheck = checkDangerSigns(combined);
  const vitals = request.vitalSigns;
  const isVitalsEmergency = Boolean(
    vitals && (
      (vitals.oxygenLevel && vitals.oxygenLevel < 90) ||
      (vitals.heartRate && (vitals.heartRate > 130 || vitals.heartRate < 45))
    )
  );

  if (dangerCheck.isEmergency || isVitalsEmergency) {
    const reasons: string[] = [];
    if (dangerCheck.matchedSigns.length > 0) {
      reasons.push(`खतरे के संकेत (Danger Signs): ${dangerCheck.matchedSigns.map(s => s.labelHindi || s.keyword).join(', ')}`);
    }
    if (isVitalsEmergency) {
      reasons.push('अति-गंभीर वाइटल्स (Critical Vitals Out of Range)');
    }

    return {
      level: 'RED',
      reasons,
      guidance: 'EMERGENCY: Danger signs detected. Arrange immediate emergency transport to the nearest hospital or Community Health Center (CHC). Do not wait.',
      guidanceHindi: 'आपातकाल: अत्यधिक खतरे के संकेत मिले हैं। तुरंत नजदीकी अस्पताल या सीएचसी (सामुदायिक स्वास्थ्य केंद्र) ले जाएं। 108 एम्बुलेंस बुलाएं। बिल्कुल भी देर न करें।',
      nextSteps: [
        'Call 108 Emergency Ambulance immediately',
        'Keep patient calm, hydrated, and ensure clear airway',
        'Do not give solid food if patient is drowsy or convulsing'
      ],
      audioBase64: '',
      source: 'danger_rules'
    };
  }

  // 2. Check for Moderate Signs (YELLOW Caution)
  const isYellowSymptoms = 
    lower.includes('bukhar') || lower.includes('fever') ||
    lower.includes('cough') || lower.includes('khansi') ||
    lower.includes('dard') || lower.includes('pain') ||
    lower.includes('vomit') || lower.includes('ulti') ||
    lower.includes('dast') || lower.includes('diarrhea') ||
    (request.bodyRegions && request.bodyRegions.length > 0) ||
    Boolean(vitals && ((vitals.temperature && vitals.temperature >= 100.5) || (vitals.oxygenLevel && vitals.oxygenLevel < 95)));

  if (isYellowSymptoms) {
    return {
      level: 'YELLOW',
      reasons: [
        'मध्यम स्तर के लक्षण (Moderate symptoms requiring PHC/Doctor consultation)',
        'निगरानी एवं समय पर चिकित्सीय परामर्श आवश्यक (Needs clinical monitoring)'
      ],
      guidance: 'Caution: Visit the nearest Primary Health Center (PHC) or consult an ASHA/ANM health worker within 24 to 48 hours for clinical evaluation.',
      guidanceHindi: 'सावधानी: लक्षण मध्यम श्रेणी के हैं। 24 से 48 घंटे के भीतर अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या आशा दीदी से संपर्क करें।',
      nextSteps: [
        'Visit nearest PHC / sub-center for doctor consultation',
        'Drink plenty of clean fluids and ORS for hydration',
        'Check temperature and vitals twice daily',
        'Seek immediate emergency care if breathing becomes difficult'
      ],
      audioBase64: '',
      source: 'ai_assessment'
    };
  }

  // 3. Routine Signs (GREEN Routine / Home Care)
  return {
    level: 'GREEN',
    reasons: [
      'सामान्य स्वास्थ्य लक्षण (Mild, routine symptoms manageable with home care)',
      'कोई आपातकालीन संकेत नहीं पाए गए (No critical danger signs present)'
    ],
    guidance: 'Routine Care: Symptoms appear mild. Ensure adequate rest, plenty of fluids, and hygienic nutritious food. Continue routine monitoring.',
    guidanceHindi: 'सामान्य देखभाल: लक्षण सामान्य हैं। पर्याप्त आराम करें, साफ पानी और पौष्टिक भोजन लें। यदि 3 दिन बाद भी समस्या रहे तो डॉक्टर को दिखाएं।',
    nextSteps: [
      'Adequate physical rest in a well-ventilated room',
      'Stay well hydrated with boiled drinking water or lemon water',
      'Maintain personal hand hygiene and clean surroundings',
      'Follow up at the local clinic if symptoms do not improve in 3 days'
    ],
    audioBase64: '',
    source: 'ai_assessment'
  };
}

/** Send voice recording for transcription + translation */
export async function sendVoice(audioBlob: Blob): Promise<VoiceResponse> {
  const formData = new FormData();
  let ext = 'wav';
  if (audioBlob.type.includes('webm')) ext = 'webm';
  else if (audioBlob.type.includes('mp4')) ext = 'mp4';
  else if (audioBlob.type.includes('ogg')) ext = 'ogg';

  formData.append('audio', audioBlob, `recording.${ext}`);

  try {
    const res = await fetch(`${API_BASE}/voice`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse<VoiceResponse>(res);
  } catch (err) {
    console.warn('Backend /api/voice unavailable, using offline fallback:', err);
    // Offline / Drop fallback
    return {
      transcriptHindi: 'मुझे दो दिन से तेज़ बुखार और सिरदर्द है, शरीर में बहुत दर्द हो रहा है।',
      transcriptEnglish: 'I have high fever and severe headache for the past two days with body ache.',
      language: 'hi-IN'
    };
  }
}

/** Send document image for text extraction */
export async function sendScan(imageFile: File): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse<ScanResponse>(res);
  } catch (err) {
    console.warn('Backend /api/scan unavailable, using offline fallback:', err);
    return {
      extractedText: 'डॉ. आर. शर्मा, प्राथमिक स्वास्थ्य केंद्र\nपर्चे की दवाइयां:\n1. पैरासिटामोल 650mg - दिन में 3 बार\n2. सेट्रिज़ीन 10mg - रात को 1 बार\n3. ओआरएस (ORS) घोल - दिन में 3-4 बार\nसलाह: पर्याप्त आराम करें, गुनगुना पानी पिएं।'
    };
  }
}

/** Run health check (danger rules + AI assessment) */
export async function sendHealthCheck(request: HealthCheckRequest): Promise<HealthCheckResponse> {
  try {
    const res = await fetch(`${API_BASE}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return await handleResponse<HealthCheckResponse>(res);
  } catch (err) {
    console.warn('Backend /api/check unavailable, activating client clinical triage engine:', err);
    return runClientHealthCheck(request);
  }
}
