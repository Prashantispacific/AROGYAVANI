const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-2.5-flash'
];

export interface GeminiResponse {
  text: string;
  data: any;
  model: string;
}

export async function callGemini(
  contents: any[],
  generationConfig?: any,
  apiKey?: string
): Promise<GeminiResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            ...(generationConfig ? { generationConfig } : {})
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        return { text, data, model };
      }

      const errText = await res.text();
      console.warn(`Gemini model ${model} failed (${res.status}): ${errText.slice(0, 120)}`);
      lastError = new Error(`Gemini (${model}) ${res.status}: ${errText}`);

      // If rate limited (429), unavailable (503), not found (404), or server error (500), try next model
      if ([429, 503, 404, 500].includes(res.status)) {
        continue;
      } else {
        // Bad request or schema violation, do not loop further
        throw lastError;
      }
    } catch (err: any) {
      lastError = err;
      if (err.message && err.message.includes('GEMINI_API_KEY')) {
        throw err;
      }
      continue;
    }
  }

  throw lastError || new Error('All Gemini fallback models exhausted');
}
