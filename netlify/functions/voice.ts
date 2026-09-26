import type { Context } from '@netlify/functions';
import { callGemini } from './_gemini';

async function transcribeWithGemini(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<{ transcriptHindi: string; transcriptEnglish: string }> {
  const base64 = Buffer.from(fileBuffer).toString('base64');
  const cleanMime = mimeType ? mimeType.split(';')[0] : 'audio/webm';

  const result = await callGemini(
    [
      {
        parts: [
          { inlineData: { mimeType: cleanMime, data: base64 } },
          {
            text: 'You are an expert multilingual medical speech-to-text assistant for Indian healthcare. The patient or ASHA worker may speak in ANY Indian regional language (Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia) or dialect (Bhojpuri, Maithili, Awadhi, Rajasthani, Haryanvi, Marwari, Chhattisgarhi, etc.) or code-mixed speech (e.g., Hinglish). Accurately understand what was said, transcribe/translate it into Hindi (Devanagari script) for "transcriptHindi", and provide an accurate clinical English translation for "transcriptEnglish". If no clear speech is heard, return empty strings for both.'
          }
        ]
      }
    ],
    {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          transcriptHindi: { type: 'string' },
          transcriptEnglish: { type: 'string' }
        },
        required: ['transcriptHindi', 'transcriptEnglish']
      }
    },
    apiKey
  );

  if (!result.text) {
    throw new Error('No transcription returned from Gemini');
  }

  return JSON.parse(result.text);
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!sarvamApiKey && !geminiApiKey) {
      return Response.json({ error: 'API keys are not set' }, { status: 500 });
    }

    const reqFormData = await req.formData();
    const audioFile = reqFormData.get('audio') || reqFormData.get('file');

    if (!audioFile || typeof audioFile === 'string') {
      return Response.json({ error: 'ऑडियो फ़ाइल आवश्यक है (Audio file is required)' }, { status: 400 });
    }

    if (audioFile.size === 0) {
      return Response.json(
        { error: 'रिकॉर्डिंग खाली है। कृपया माइक दबाकर बोलें। (Recording is empty. Please speak into the mic.)' },
        { status: 422 }
      );
    }

    const fileBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || 'audio/webm';
    let transcriptHindi = '';
    let transcriptEnglish = '';
    let detectedLang = 'hi-IN';

    // 1. Primary: Try Sarvam ASR (Saaras v4)
    if (sarvamApiKey) {
      try {
        const asrFormData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        asrFormData.append('file', blob, audioFile.name || 'recording.webm');
        asrFormData.append('model', 'saaras:v4');
        asrFormData.append('language_code', 'unknown');

        const asrResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: {
            'api-subscription-key': sarvamApiKey
          },
          body: asrFormData
        });

        if (asrResponse.ok) {
          const asrData = await asrResponse.json();
          const transcriptRaw = asrData.transcript;

          if (transcriptRaw && transcriptRaw.trim()) {
            detectedLang = asrData.language_code || 'hi-IN';
            transcriptHindi = transcriptRaw.trim();
            transcriptEnglish = transcriptRaw.trim();

            // Check if detected language is one of Sarvam supported Indian languages
            const SARVAM_SUPPORTED_LANGS = [
              'hi-IN', 'bn-IN', 'kn-IN', 'ml-IN', 'mr-IN',
              'od-IN', 'pa-IN', 'ta-IN', 'te-IN', 'gu-IN', 'en-IN'
            ];
            const sourceLang = SARVAM_SUPPORTED_LANGS.includes(detectedLang) ? detectedLang : 'hi-IN';

            // 1. If English, translate to Hindi for beneficiary record
            if (sourceLang === 'en-IN') {
              try {
                const translateResponse = await fetch('https://api.sarvam.ai/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': sarvamApiKey
                  },
                  body: JSON.stringify({
                    input: transcriptRaw,
                    source_language_code: 'en-IN',
                    target_language_code: 'hi-IN'
                  })
                });

                if (translateResponse.ok) {
                  const translateData = await translateResponse.json();
                  if (translateData.translated_text) {
                    transcriptHindi = translateData.translated_text;
                  }
                }
              } catch (transErr) {
                console.warn('English-to-Hindi translation fallback:', transErr);
              }
            } else if (sourceLang === 'hi-IN') {
              // 2. If Hindi, translate to English for clinical risk assessment & triage
              try {
                const translateResponse = await fetch('https://api.sarvam.ai/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': sarvamApiKey
                  },
                  body: JSON.stringify({
                    input: transcriptRaw,
                    source_language_code: 'hi-IN',
                    target_language_code: 'en-IN'
                  })
                });

                if (translateResponse.ok) {
                  const translateData = await translateResponse.json();
                  if (translateData.translated_text) {
                    transcriptEnglish = translateData.translated_text;
                  }
                }
              } catch (transErr) {
                console.warn('Hindi-to-English translation fallback:', transErr);
              }
            } else {
              // 3. If Regional Indian Language (e.g. Marathi, Bengali, Tamil, Telugu, Gujarati, Kannada, etc.)
              // First translate to English for clinical classification & danger sign checking
              try {
                const toEnglishRes = await fetch('https://api.sarvam.ai/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': sarvamApiKey
                  },
                  body: JSON.stringify({
                    input: transcriptRaw,
                    source_language_code: sourceLang,
                    target_language_code: 'en-IN'
                  })
                });
                if (toEnglishRes.ok) {
                  const data = await toEnglishRes.json();
                  if (data.translated_text) {
                    transcriptEnglish = data.translated_text;
                  }
                }
              } catch (err) {
                console.warn('Regional-to-English translation error:', err);
              }

              // Also translate to Hindi for standardized ASHA/PHC reporting
              try {
                const toHindiRes = await fetch('https://api.sarvam.ai/translate', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': sarvamApiKey
                  },
                  body: JSON.stringify({
                    input: transcriptRaw,
                    source_language_code: sourceLang,
                    target_language_code: 'hi-IN'
                  })
                });
                if (toHindiRes.ok) {
                  const data = await toHindiRes.json();
                  if (data.translated_text) {
                    transcriptHindi = data.translated_text;
                  }
                }
              } catch (err) {
                console.warn('Regional-to-Hindi translation error:', err);
              }
            }
          }
        } else {
          console.warn('Sarvam ASR returned status:', asrResponse.status);
        }
      } catch (sarvamErr) {
        console.warn('Sarvam ASR request failed, trying Gemini fallback:', sarvamErr);
      }
    }

    // 2. High-accuracy Fallback: Gemini Multimodal Audio STT (multi-model cascade)
    if ((!transcriptHindi || !transcriptEnglish) && geminiApiKey) {
      try {
        console.log('Using Gemini for audio transcription fallback...');
        const geminiResult = await transcribeWithGemini(fileBuffer, mimeType, geminiApiKey);
        if (geminiResult.transcriptHindi || geminiResult.transcriptEnglish) {
          transcriptHindi = geminiResult.transcriptHindi || geminiResult.transcriptEnglish;
          transcriptEnglish = geminiResult.transcriptEnglish || geminiResult.transcriptHindi;
          detectedLang = 'hi-IN';
        }
      } catch (geminiErr) {
        console.error('Gemini audio transcription error:', geminiErr);
      }
    }

    // 3. If neither engine could detect speech
    if (!transcriptHindi || transcriptHindi.trim() === '') {
      return Response.json(
        { error: 'आवाज़ पहचान में नहीं आई। कृपया थोड़ा साफ़ या तेज़ बोलें। (Could not detect speech in audio. Please speak louder and clearer.)' },
        { status: 422 }
      );
    }

    return Response.json({
      transcriptHindi,
      transcriptEnglish,
      language: detectedLang
    });
  } catch (error: any) {
    console.error('Voice function error:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
};
