import type { Context } from '@netlify/functions';
import { callGemini } from './_gemini';

async function extractWithGemini(fileBuffer: ArrayBuffer, mimeType: string, apiKey: string): Promise<string> {
  const base64 = Buffer.from(fileBuffer).toString('base64');
  const cleanMime = mimeType ? mimeType.split(';')[0] : 'image/jpeg';
  
  const result = await callGemini(
    [
      {
        parts: [
          { inlineData: { mimeType: cleanMime, data: base64 } },
          {
            text: 'Extract and transcribe all medical text, prescriptions, medicines, dosages, and patient details from this document accurately in simple readable format. If no text is readable, say "No readable text found".'
          }
        ]
      }
    ],
    undefined,
    apiKey
  );

  return result.text || '';
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
    const imageFile = reqFormData.get('image') || reqFormData.get('file');

    if (!imageFile || typeof imageFile === 'string') {
      return Response.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const fileBuffer = await imageFile.arrayBuffer();
    const mimeType = imageFile.type || 'image/jpeg';
    let extractedText = '';
    let jobId: string | undefined;

    // 1. High-speed OCR with Gemini Vision (supports handwritten & printed Hindi/English scripts)
    if (geminiApiKey) {
      try {
        extractedText = await extractWithGemini(fileBuffer, mimeType, geminiApiKey);
        if (extractedText && !extractedText.toLowerCase().includes('no readable text found')) {
          jobId = 'gemini-vision-ocr';
        }
      } catch (geminiErr) {
        console.warn('Gemini vision OCR error, trying Sarvam Doc-AI fallback:', geminiErr);
      }
    }

    // 2. Fallback to Sarvam Doc-AI Digitise if Gemini did not find text
    if ((!extractedText || extractedText.toLowerCase().includes('no readable text found')) && sarvamApiKey) {
      try {
        const digitiseFormData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        digitiseFormData.append('file', blob, imageFile.name || 'document.jpg');

        const digitiseRes = await fetch('https://api.sarvam.ai/doc-ai/v1/job/digitise', {
          method: 'POST',
          headers: { 'api-subscription-key': sarvamApiKey },
          body: digitiseFormData
        });

        if (digitiseRes.ok) {
          const digitiseData = await digitiseRes.json();
          jobId = digitiseData.job_id;

          if (jobId) {
            let status = 'pending';
            let polls = 0;
            // Quick poll max 3 times (~4.5s)
            while (polls < 3) {
              await new Promise(resolve => setTimeout(resolve, 1500));
              polls++;

              const statusRes = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/status`, {
                headers: { 'api-subscription-key': sarvamApiKey }
              });

              if (statusRes.ok) {
                const statusData = await statusRes.json();
                status = statusData.status;
                if (status === 'completed' || status === 'failed') break;
              }
            }

            if (status === 'completed') {
              const resultsRes = await fetch(`https://api.sarvam.ai/doc-ai/v1/job/${jobId}/results`, {
                headers: { 'api-subscription-key': sarvamApiKey }
              });

              if (resultsRes.ok) {
                const resultsData = await resultsRes.json();
                const textLines: string[] = [];
                if (resultsData.documents && Array.isArray(resultsData.documents)) {
                  for (const doc of resultsData.documents) {
                    if (doc.pages && Array.isArray(doc.pages)) {
                      for (const page of doc.pages) {
                        if (page.blocks && Array.isArray(page.blocks)) {
                          for (const block of page.blocks) {
                            if (block.text && typeof block.text === 'string' && block.text.trim()) {
                              textLines.push(block.text.trim());
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (textLines.length > 0) {
                  extractedText = textLines.join('\n');
                }
              }
            }
          }
        }
      } catch (sarvamErr) {
        console.warn('Sarvam Doc-AI processing issue:', sarvamErr);
      }
    }

    if (!extractedText || extractedText.toLowerCase().includes('no readable text found')) {
      extractedText = 'दस्तावेज़ में कोई स्पष्ट पाठ नहीं मिला (No readable text found in document)';
    }

    return Response.json({
      extractedText,
      jobId: jobId || 'ocr-completed'
    });

  } catch (error: any) {
    console.error('Scan function error:', error);
    return Response.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
};
