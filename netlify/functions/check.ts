import type { Context } from '@netlify/functions';
import { callGemini } from './_gemini';

const dangerSignKeywords = [
  'chest pain', 'seene mein dard', 'chaati mein dard',
  'breathing difficulty', 'saans nahi aa rahi', 'dum ghut raha', 'breathless',
  'unconscious', 'behosh', 'hosh nahi', 'unresponsive',
  'seizure', 'fits', 'daura', 'convulsion', 'mirgi',
  'heavy bleeding', 'bahut khoon', 'hemorrhage',
  'unable to drink', 'pee nahi pa raha',
  'severe headache', 'tez sir dard', 'nazar dhundli'
];

async function generateHindiTTS(text: string, apiKey: string): Promise<string> {
  const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey
    },
    body: JSON.stringify({
      text,
      language_code: 'hi-IN',
      model: 'bulbul:v3',
      speaker: 'priya',
      pace: 0.9
    })
  });
  
  if (!ttsRes.ok) throw new Error(`TTS failed: ${await ttsRes.text()}`);
  const ttsData = await ttsRes.json();
  return ttsData.audios[0];
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!sarvamApiKey && !geminiApiKey) {
      return new Response('API keys are not set', { status: 500 });
    }

    const body = await req.json();
    let { symptoms = '', bodyRegions, documentText, vitalSigns } = body;

    if (!symptoms || symptoms.trim() === '') {
      if (bodyRegions && bodyRegions.length > 0) {
        symptoms = `Patient reported discomfort in body regions: ${bodyRegions.join(', ')}`;
      } else {
        symptoms = 'General clinical assessment request';
      }
    }

    const lowerSymptoms = symptoms.toLowerCase();
    
    // Deterministic danger-sign check (RED Alert Path)
    const matchedDangerSigns = dangerSignKeywords.filter(kw => lowerSymptoms.includes(kw));

    if (matchedDangerSigns.length > 0) {
      const guidance = "EMERGENCY: Danger signs detected. Please rush the patient to the nearest hospital immediately. Do not wait.";
      const guidanceHindi = "आपातकाल: खतरे के संकेत मिले हैं। कृपया मरीज को तुरंत नजदीकी अस्पताल ले जाएं। बिल्कुल भी इंतजार न करें।";
      
      let audioBase64 = '';
      if (sarvamApiKey) {
        try {
          audioBase64 = await generateHindiTTS(guidanceHindi, sarvamApiKey);
        } catch (ttsErr) {
          console.warn('TTS generation failed for danger signs:', ttsErr);
        }
      }

      return Response.json({
        level: 'RED',
        reasons: [`Danger signs detected: ${matchedDangerSigns.join(', ')}`],
        guidance,
        guidanceHindi,
        nextSteps: ['Call ambulance or arrange transport immediately', 'Keep the patient comfortable and hydrated'],
        audioBase64,
        source: 'danger_rules'
      });
    }

    // Call Gemini for AI clinical risk assessment
    const geminiPrompt = `
You are assisting an ASHA worker in rural India. Analyze the patient data and categorize the clinical risk as YELLOW (caution/consult health center within 1-2 days) or GREEN (routine home care/monitor).
NEVER diagnose diseases. Use simple language. Provide guidance in English and Hindi (Devanagari script). Include specific next steps.

Patient Data:
Symptoms: ${symptoms}
Body Regions: ${JSON.stringify(bodyRegions || [])}
Document Text: ${documentText || 'None'}
Vital Signs: ${JSON.stringify(vitalSigns || {})}
`;

    const geminiResult = await callGemini(
      [{ parts: [{ text: geminiPrompt }] }],
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            level: { type: "string", enum: ["YELLOW", "GREEN"] },
            reasons: { type: "array", items: { type: "string" } },
            guidance: { type: "string" },
            guidanceHindi: { type: "string" },
            nextSteps: { type: "array", items: { type: "string" } }
          },
          required: ["level", "reasons", "guidance", "guidanceHindi", "nextSteps"]
        }
      },
      geminiApiKey
    );

    const aiResult = JSON.parse(geminiResult.text);

    // Generate Hindi voice guidance via Sarvam Bulbul TTS (with graceful fallback)
    let audioBase64 = '';
    if (sarvamApiKey) {
      try {
        audioBase64 = await generateHindiTTS(aiResult.guidanceHindi, sarvamApiKey);
      } catch (ttsErr) {
        console.warn('TTS generation failed for AI result:', ttsErr);
      }
    }

    return Response.json({
      level: aiResult.level,
      reasons: aiResult.reasons,
      guidance: aiResult.guidance,
      guidanceHindi: aiResult.guidanceHindi,
      nextSteps: aiResult.nextSteps,
      audioBase64,
      source: 'ai_assessment'
    });

  } catch (error: any) {
    console.error('Check function error:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
};
