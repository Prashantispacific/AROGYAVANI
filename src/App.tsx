import { useReducer, useCallback } from 'react';
import { User, Shield, ArrowRight, ArrowLeft, Users, PhoneCall, Sparkles, AlertTriangle, HeartPulse } from 'lucide-react';
import { AppState, UserMode, VitalsState, AppStep, HealthCheckResponse, UILanguage } from '@/lib/types';
import { checkDangerSigns } from '@/lib/rules';
import { sendVoice, sendHealthCheck } from '@/lib/api';
import { StepIndicator } from '@/components/StepIndicator';
import { VoiceButton } from '@/components/VoiceButton';
import { DocumentScanner } from '@/components/DocumentScanner';
import { BodyMap } from '@/components/BodyMap';
import { VitalsInput } from '@/components/VitalsInput';
import { ResultCard } from '@/components/ResultCard';
import { Footer } from '@/components/Footer';
import { LanguageSelector } from '@/components/LanguageSelector';
import { t } from '@/lib/i18n';

type AppAction =
  | { type: 'SET_USER_MODE'; payload: UserMode }
  | { type: 'SET_UI_LANGUAGE'; payload: UILanguage }
  | { type: 'SET_PATIENT_INFO'; payload: { name?: string; age?: string; gender?: string } }
  | { type: 'SET_VITALS'; payload: VitalsState }
  | { type: 'VERIFY_ASHA' }
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSCRIPT'; payload: { hindi: string; english: string } }
  | { type: 'TOGGLE_REGION'; payload: string }
  | { type: 'SET_DOCUMENT_TEXT'; payload: string }
  | { type: 'SET_RESULT'; payload: HealthCheckResponse }
  | { type: 'RESET' };

const initialState: AppState = {
  step: 'speak',
  userMode: 'patient',
  uiLanguage: 'hi',
  patientName: '',
  patientAge: '',
  patientGender: 'महिला',
  transcriptHindi: '',
  transcriptEnglish: '',
  selectedRegions: [],
  documentText: '',
  vitals: {},
  isAshaVerified: false,
  isLoading: false,
  error: null,
  result: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_MODE': 
      return { ...state, userMode: action.payload };
    case 'SET_UI_LANGUAGE':
      return { ...state, uiLanguage: action.payload };
    case 'SET_PATIENT_INFO': 
      return { 
        ...state, 
        patientName: action.payload.name !== undefined ? action.payload.name : state.patientName,
        patientAge: action.payload.age !== undefined ? action.payload.age : state.patientAge,
        patientGender: action.payload.gender !== undefined ? action.payload.gender : state.patientGender
      };
    case 'SET_VITALS': 
      return { ...state, vitals: action.payload };
    case 'VERIFY_ASHA': 
      return { ...state, isAshaVerified: true };
    case 'SET_STEP': 
      return { ...state, step: action.payload, error: null };
    case 'SET_LOADING': 
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR': 
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TRANSCRIPT': 
      return { 
        ...state, 
        transcriptHindi: action.payload.hindi, 
        transcriptEnglish: action.payload.english 
      };
    case 'TOGGLE_REGION': {
      const exists = state.selectedRegions.includes(action.payload);
      return { 
        ...state, 
        selectedRegions: exists 
          ? state.selectedRegions.filter(r => r !== action.payload)
          : [...state.selectedRegions, action.payload]
      };
    }
    case 'SET_DOCUMENT_TEXT': 
      return { ...state, documentText: action.payload };
    case 'SET_RESULT': 
      return { ...state, result: action.payload, step: 'result', isLoading: false };
    case 'RESET': 
      return { 
        ...initialState, 
        userMode: state.userMode,
        uiLanguage: state.uiLanguage,
        patientName: '',
        patientAge: '',
        patientGender: 'महिला',
        vitals: {},
      };
    default: 
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleVoiceRecording = useCallback(async (blob: Blob) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await sendVoice(blob);
      dispatch({ 
        type: 'SET_TRANSCRIPT', 
        payload: { hindi: response.transcriptHindi, english: response.transcriptEnglish } 
      });
      
      // Client-side emergency check
      const dangerCheck = checkDangerSigns(`${response.transcriptEnglish} ${response.transcriptHindi}`);
      if (dangerCheck.isEmergency) {
        console.warn("DANGER SIGNS DETECTED LOCALLY:", dangerCheck.matchedSigns);
      }
    } catch (err: any) {
      console.error('Voice transcription error:', err);
      dispatch({ type: 'SET_ERROR', payload: err.message || 'आवाज़ समझ नहीं आई। कृपया फिर से कोशिश करें।' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const handleScanComplete = (text: string) => {
    dispatch({ type: 'SET_DOCUMENT_TEXT', payload: text });
  };

  const submitHealthCheck = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const combinedSymptoms =
        `${state.transcriptEnglish} ${state.transcriptHindi}`.trim() ||
        (state.selectedRegions.length > 0
          ? `Discomfort in body regions: ${state.selectedRegions.join(', ')}`
          : 'General health checkup');

      const result = await sendHealthCheck({
        symptoms: combinedSymptoms,
        bodyRegions: state.selectedRegions,
        documentText: state.documentText || undefined,
        vitalSigns: state.userMode === 'asha' ? state.vitals : undefined,
      });
      dispatch({ type: 'SET_RESULT', payload: result });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'सर्वर से संपर्क नहीं हो सका। कृपया बाद में प्रयास करें।' });
    }
  };

  return (
    <div className="min-h-screen bg-medical-depth text-slate-100 font-sans relative overflow-x-hidden pb-16">
      {/* Decorative Atmospheric Radial Ambient Orbs */}
      <div className="glow-orb-primary top-10 left-1/4 -translate-x-1/2" />
      <div className="glow-orb-cyan top-96 right-10" />
      <div className="glow-orb-primary bottom-32 left-10" />

      {/* Professional Health Navigation Header */}
      <header className="bg-slate-950/80 backdrop-blur-2xl text-white py-3.5 px-4 sticky top-0 z-40 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-hindi">
                    आरोग्यवाणी
                  </h1>
                  <span className="text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AarogyaVani
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{t('tagline', state.uiLanguage)}</p>
              </div>
            </div>

            {/* Quick Emergency 108 Hotline Chip (Visible on Mobile) */}
            <a
              href="tel:108"
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
            >
              <PhoneCall className="w-3 h-3 text-rose-400 animate-pulse" />
              108
            </a>
          </div>

          {/* Right Header: Dual Mode Switcher, Language Selector & Emergency Hotline */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap sm:flex-nowrap">
            {/* Desktop Emergency Hotline */}
            <a
              href="tel:108"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-bold transition-all shadow-sm group"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              {t('emergency108', state.uiLanguage)}
            </a>

            {/* Compact Language Selector Dropdown */}
            <LanguageSelector
              currentLanguage={state.uiLanguage}
              onLanguageChange={(lang) => dispatch({ type: 'SET_UI_LANGUAGE', payload: lang })}
            />

            {/* Segmented Dual Mode Switcher */}
            <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-white/10 shadow-inner">
              <button
                onClick={() => dispatch({ type: 'SET_USER_MODE', payload: 'patient' })}
                type="button"
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  state.userMode === 'patient'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {t('citizenMode', state.uiLanguage)}
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_USER_MODE', payload: 'asha' })}
                type="button"
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  state.userMode === 'asha'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {t('ashaMode', state.uiLanguage)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Sub-banner Guide */}
      <div className="max-w-3xl mx-auto px-4 pt-3">
        <div className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between shadow-lg backdrop-blur-xl ${
          state.userMode === 'asha' 
            ? 'bg-teal-950/40 border-teal-500/30 text-teal-200' 
            : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-base">{state.userMode === 'asha' ? '👩‍⚕️' : '🧑‍🌾'}</span>
            <span>
              {state.userMode === 'asha' 
                ? t('modeBannerAsha', state.uiLanguage)
                : t('modeBannerCitizen', state.uiLanguage)}
            </span>
          </div>
          <button 
            type="button"
            onClick={() => dispatch({ 
              type: 'SET_USER_MODE', 
              payload: state.userMode === 'asha' ? 'patient' : 'asha' 
            })}
            className="font-bold underline text-white hover:text-emerald-300 shrink-0 ml-3 cursor-pointer"
          >
            {t('switchMode', state.uiLanguage)}
          </button>
        </div>
      </div>

      {state.step !== 'result' && (
        <StepIndicator 
          currentStep={state.step} 
          onSelectStep={(step) => dispatch({ type: 'SET_STEP', payload: step })} 
          uiLanguage={state.uiLanguage}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-4 relative space-y-6">
        {state.error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/40 text-rose-200 rounded-2xl shadow-xl flex justify-between items-center animate-fade-in backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="font-semibold text-xs sm:text-sm">{state.error}</p>
            </div>
            <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="text-rose-400 hover:text-white font-bold px-2 cursor-pointer text-lg">&times;</button>
          </div>
        )}

        {state.step === 'speak' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* ASHA Mode: Beneficiary Profile Card */}
            {state.userMode === 'asha' && (
              <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">{t('beneficiaryTitle', state.uiLanguage)}</h3>
                    <p className="text-[11px] text-slate-400">{t('beneficiarySub', state.uiLanguage)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{t('nameLabel', state.uiLanguage)}</label>
                    <input
                      type="text"
                      placeholder={t('namePlaceholder', state.uiLanguage)}
                      value={state.patientName}
                      onChange={(e) => dispatch({ type: 'SET_PATIENT_INFO', payload: { name: e.target.value } })}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{t('ageLabel', state.uiLanguage)}</label>
                    <input
                      type="text"
                      placeholder={t('agePlaceholder', state.uiLanguage)}
                      value={state.patientAge}
                      onChange={(e) => dispatch({ type: 'SET_PATIENT_INFO', payload: { age: e.target.value } })}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">{t('genderLabel', state.uiLanguage)}</label>
                    <select
                      value={state.patientGender}
                      onChange={(e) => dispatch({ type: 'SET_PATIENT_INFO', payload: { gender: e.target.value } })}
                      className="w-full bg-slate-950/70 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all cursor-pointer"
                    >
                      <option value="महिला">{t('genderFemale', state.uiLanguage)}</option>
                      <option value="पुरुष">{t('genderMale', state.uiLanguage)}</option>
                      <option value="शिशु/बच्चा">{t('genderChild', state.uiLanguage)}</option>
                      <option value="अन्य">{t('genderOther', state.uiLanguage)}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Voice Input Card */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
                {state.userMode === 'asha' ? (state.uiLanguage === 'hi' ? 'मरीज़ की समस्या सुनें या बोलें' : 'Listen or Record Patient Symptoms') : t('voiceHeroTitle', state.uiLanguage)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6">
                {state.userMode === 'asha' ? 'Record patient symptom voice note' : t('voiceHeroSub', state.uiLanguage)}
              </p>
              
              <VoiceButton 
                onRecordingComplete={handleVoiceRecording} 
                isProcessing={state.isLoading} 
                hasTranscript={Boolean(state.transcriptHindi)} 
                uiLanguage={state.uiLanguage}
              />
              
              {/* Recognized Transcript Display Box */}
              {state.transcriptHindi && (
                <div className="mt-6 p-4 sm:p-5 bg-slate-950/70 rounded-2xl border border-emerald-500/30 text-left animate-fade-in shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t('recognizedTitle', state.uiLanguage)}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Hindi (Devanagari)
                    </span>
                  </div>
                  <p className="text-base sm:text-lg text-white font-medium leading-relaxed">{state.transcriptHindi}</p>
                </div>
              )}

              {/* Manual input / Edit symptoms fallback */}
              <div className="mt-5 pt-5 border-t border-white/10 text-left">
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  {t('orTypeLabel', state.uiLanguage)}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('typePlaceholder', state.uiLanguage)}
                  value={state.transcriptHindi}
                  onChange={(e) => dispatch({ 
                    type: 'SET_TRANSCRIPT', 
                    payload: { hindi: e.target.value, english: e.target.value } 
                  })}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-2xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all resize-y"
                />
              </div>

              {/* Instant Client-side Danger Sign Alert */}
              {(() => {
                const dangerCheck = checkDangerSigns(`${state.transcriptEnglish} ${state.transcriptHindi}`);
                if (!dangerCheck.isEmergency) return null;
                return (
                  <div className="mt-5 p-4 sm:p-5 bg-rose-950/80 border-2 border-rose-500/80 rounded-2xl text-left animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.35)]">
                    <div className="flex items-center gap-2 text-rose-300 font-extrabold text-base mb-1">
                      <span className="text-2xl">🚨</span>
                      <span>{t('dangerSignAlert', state.uiLanguage)}</span>
                    </div>
                    <p className="text-xs text-rose-200 mb-2">
                      {t('dangerSignRecognized', state.uiLanguage)} {dangerCheck.matchedSigns.map((s: { labelHindi: string }) => s.labelHindi).join(', ')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-white bg-rose-900/60 border border-rose-500/40 p-3 rounded-xl flex items-center gap-2">
                      👉 {dangerCheck.matchedSigns[0]?.action}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* ASHA Mode: Optional Vitals Capture */}
            {state.userMode === 'asha' && (
              <VitalsInput
                vitals={state.vitals}
                onChange={(vitals) => dispatch({ type: 'SET_VITALS', payload: vitals })}
                uiLanguage={state.uiLanguage}
              />
            )}

            {/* Body Map Visual Symptom Selector */}
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl">
              <BodyMap 
                selectedRegions={state.selectedRegions} 
                onToggleRegion={(id) => dispatch({ type: 'TOGGLE_REGION', payload: id })} 
                uiLanguage={state.uiLanguage}
              />
            </div>

            {/* Navigation Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
              <button
                onClick={submitHealthCheck}
                disabled={!state.transcriptHindi && state.selectedRegions.length === 0}
                className="btn-secondary text-sm sm:text-base px-6 py-3.5 w-full sm:w-auto text-center cursor-pointer disabled:opacity-50"
              >
                {t('checkNow', state.uiLanguage)}
              </button>
              <div className="w-full sm:w-auto sm:ml-auto">
                <button 
                  onClick={() => dispatch({ type: 'SET_STEP', payload: 'scan' })}
                  disabled={!state.transcriptHindi && state.selectedRegions.length === 0}
                  className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base px-8 py-3.5 w-full sm:w-auto cursor-pointer disabled:opacity-50"
                >
                  {t('addDocuments', state.uiLanguage)} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {state.step === 'scan' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-1">
                {t('scannerTitle', state.uiLanguage)}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mb-6">
                {t('scannerSub', state.uiLanguage)}
              </p>
              
              <DocumentScanner 
                onScanComplete={handleScanComplete} 
                isProcessing={state.isLoading} 
                uiLanguage={state.uiLanguage}
              />
              
              {state.documentText && (
                <div className="mt-5 p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-lg">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                  {t('docDigitizedBadge', state.uiLanguage)}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'speak' })}
                className="btn-secondary text-sm sm:text-base flex items-center justify-center gap-2 py-3.5 px-6 font-bold cursor-pointer"
                disabled={state.isLoading}
              >
                <ArrowLeft className="w-4 h-4" /> {t('backBtn', state.uiLanguage)}
              </button>
              <button 
                onClick={submitHealthCheck}
                className="btn-secondary flex-1 text-sm sm:text-base py-3.5 font-bold cursor-pointer"
                disabled={state.isLoading}
              >
                {t('skipDocs', state.uiLanguage)}
              </button>
              <button 
                onClick={submitHealthCheck}
                className="btn-primary flex-1 text-sm sm:text-base py-3.5 font-bold cursor-pointer"
                disabled={state.isLoading}
              >
                {state.isLoading ? t('analyzingGuide', state.uiLanguage) : t('generateGuide', state.uiLanguage)}
              </button>
            </div>
          </div>
        )}

        {state.step === 'result' && state.result && (
          <ResultCard 
            result={state.result} 
            userMode={state.userMode}
            patientName={state.patientName}
            patientAge={state.patientAge}
            patientGender={state.patientGender}
            vitals={state.vitals}
            isAshaVerified={state.isAshaVerified}
            uiLanguage={state.uiLanguage}
            onReset={() => dispatch({ type: 'RESET' })}
            onAshaReview={() => dispatch({ type: 'VERIFY_ASHA' })}
          />
        )}

        {/* Global Loading Overlay for API calls */}
        {state.isLoading && state.step !== 'speak' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin"></div>
            </div>
            <p className="mt-6 text-2xl font-extrabold text-white tracking-tight">{t('analyzingGuide', state.uiLanguage)}</p>
            <p className="text-slate-400 mt-1.5 text-sm font-medium">Analyzing symptoms via AI & synthesizing health guidance...</p>
          </div>
        )}
      </main>

      {/* Comprehensive Multilingual Clinical Footer */}
      <Footer />
    </div>
  );
}

export default App;
