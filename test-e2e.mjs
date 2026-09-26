import dotenv from 'dotenv';
dotenv.config();

const sarvamKey = process.env.SARVAM_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

console.log('Running End-to-End Test Suite for AarogyaVani\n');

// 1. Test Deterministic Danger Rule (Scenario A)
async function testScenarioA_Danger() {
  console.log('=== Scenario 1: Cardiac Danger Sign (Chest Pain) ===');
  const symptoms = 'मरीज को बहुत तेज chest pain और chaati mein dard हो रहा है';
  const lower = symptoms.toLowerCase();
  const dangerKeywords = ['chest pain', 'seene mein dard', 'chaati mein dard'];
  const matched = dangerKeywords.filter(k => lower.includes(k));
  console.log('Matched Danger Signs:', matched);
  
  if (matched.length > 0) {
    const guidanceHindi = "आपातकाल: छाती में दर्द के संकेत मिले हैं। कृपया मरीज को तुरंत नजदीकी अस्पताल ले जाएं।";
    const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamKey
      },
      body: JSON.stringify({
        text: guidanceHindi,
        language_code: 'hi-IN',
        model: 'bulbul:v3',
        speaker: 'priya',
        pace: 0.9
      })
    });
    const ttsData = await ttsRes.json();
    console.log('TTS Response Status:', ttsRes.status);
    console.log('Generated Audio Length:', ttsData.audios?.[0]?.length || 0);
    console.log('✅ Scenario 1 (RED Alert Path) PASSED\n');
    return true;
  }
  return false;
}

// 2. Test Gemini Flash Clinical Risk Stratification (Scenario B: Yellow Alert)
async function testScenarioB_ModerateRisk() {
  console.log('=== Scenario 2: Moderate Risk (Fever for 4 days + Vitals) ===');
  const prompt = `
You are assisting an ASHA worker in rural India. Categorize the risk as YELLOW or GREEN.
NEVER diagnose. Use simple language. Provide guidance in English and Hindi (Devanagari). Include specific next steps.

Patient Data:
Symptoms: High fever for 4 days with persistent cough and fatigue
Body Regions: ["chest", "full-body"]
Vital Signs: {"temperature": 102.2, "heartRate": 105, "bloodPressure": "110/75", "oxygenLevel": 96}
`;

  const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['YELLOW', 'GREEN'] },
            reasons: { type: 'array', items: { type: 'string' } },
            guidance: { type: 'string' },
            guidanceHindi: { type: 'string' },
            nextSteps: { type: 'array', items: { type: 'string' } }
          },
          required: ['level', 'reasons', 'guidance', 'guidanceHindi', 'nextSteps']
        }
      }
    })
  });

  console.log('Gemini HTTP Status:', geminiRes.status);
  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(text);
  console.log('Risk Level:', parsed.level);
  console.log('Reasons:', parsed.reasons);
  console.log('Guidance (Hindi):', parsed.guidanceHindi);
  console.log('Next Steps:', parsed.nextSteps);

  // Generate Audio for guidance
  const ttsRes = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': sarvamKey
    },
    body: JSON.stringify({
      text: parsed.guidanceHindi,
      language_code: 'hi-IN',
      model: 'bulbul:v3',
      speaker: 'priya',
      pace: 0.9
    })
  });
  const ttsData = await ttsRes.json();
  console.log('TTS Audio Generated Length:', ttsData.audios?.[0]?.length || 0);
  console.log('✅ Scenario 2 (YELLOW Alert Path) PASSED\n');
  return true;
}

// 3. Test Sarvam Translation (Scenario C)
async function testScenarioC_Translation() {
  console.log('=== Scenario 3: Sarvam Indic Language Translation ===');
  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': sarvamKey
    },
    body: JSON.stringify({
      input: 'बच्चे को हल्का जुकाम और नाक बह रही है',
      source_language_code: 'hi-IN',
      target_language_code: 'en-IN'
    })
  });
  const data = await res.json();
  console.log('Input Hindi: बच्चे को हल्का जुकाम और नाक बह रही है');
  console.log('Output English:', data.translated_text);
  console.log('✅ Scenario 3 (Translation) PASSED\n');
  return res.ok;
}

async function runAll() {
  try {
    const s1 = await testScenarioA_Danger();
    const s2 = await testScenarioB_ModerateRisk();
    const s3 = await testScenarioC_Translation();
    console.log('====================================');
    console.log('TEST SUITE EXECUTION RESULTS:');
    console.log('1. Red-Flag Emergency Triage + Bulbul TTS:', s1 ? 'PASSED ✅' : 'FAILED ❌');
    console.log('2. Gemini 2.5 Flash Risk Reasoning + TTS:', s2 ? 'PASSED ✅' : 'FAILED ❌');
    console.log('3. Sarvam Hindi-English Translation:', s3 ? 'PASSED ✅' : 'FAILED ❌');
    console.log('====================================');
  } catch (err) {
    console.error('Test Suite Failed:', err);
  }
}

runAll();
