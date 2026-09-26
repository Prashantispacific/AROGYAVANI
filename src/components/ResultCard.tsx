import React from 'react';
import { Check, AlertCircle, ArrowRight, Printer, ShieldCheck, PhoneCall, Sparkles, Calendar, Clock, Stethoscope } from 'lucide-react';
import { HealthCheckResponse, UserMode, VitalsState, UILanguage } from '@/lib/types';
import { RISK_LEVEL_CONFIG } from '@/lib/constants';
import { VoicePlayer } from './VoicePlayer';
import { t } from '@/lib/i18n';

interface ResultCardProps {
  result: HealthCheckResponse;
  userMode: UserMode;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  vitals?: VitalsState;
  isAshaVerified?: boolean;
  uiLanguage?: UILanguage;
  onReset: () => void;
  onAshaReview: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  userMode,
  patientName,
  patientAge,
  patientGender,
  vitals,
  isAshaVerified = false,
  uiLanguage = 'hi',
  onReset,
  onAshaReview
}) => {
  const isEmergency = result.level === 'RED';
  const isYellow = result.level === 'YELLOW';
  const config = RISK_LEVEL_CONFIG[result.level];

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-up space-y-5">
      {/* Official ASHA / Government Clinical Referral Banner */}
      <div className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-3xl p-5 border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {userMode === 'asha' ? t('nhmSlipBadge', uiLanguage) : t('digitalSummaryBadge', uiLanguage)}
              </span>
            </div>
            <p className="font-bold text-white text-base mt-1">
              {patientName ? `${patientName} ` : `${t('patientWord', uiLanguage)} `}
              {patientAge ? `(${patientAge} ${t('yearsOld', uiLanguage)}` : ''}
              {patientGender ? ` / ${patientGender})` : patientAge ? ')' : ''}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-400" /> {currentDate}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-400" /> {t('immediateEval', uiLanguage)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center justify-center gap-2 text-xs bg-white/10 hover:bg-white/15 text-white px-4 py-2.5 rounded-2xl border border-white/10 transition-all font-bold shadow-md cursor-pointer hover:border-emerald-400/40"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          {t('printShareBtn', uiLanguage)}
        </button>
      </div>

      {/* Main Triage Status Shield Card */}
      <div className={`rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden transition-all shadow-2xl border ${
        isEmergency 
          ? 'bg-gradient-to-b from-rose-950/90 via-red-900/90 to-slate-900/95 border-rose-500/50 shadow-[0_0_50px_rgba(225,29,72,0.35)] text-white' 
          : isYellow
            ? 'bg-gradient-to-b from-amber-950/80 via-amber-900/70 to-slate-900/95 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-white'
            : 'bg-gradient-to-b from-emerald-950/80 via-emerald-900/70 to-slate-900/95 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)] text-white'
      }`}>
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 blur-3xl pointer-events-none ${
          isEmergency ? 'bg-rose-500/40' : isYellow ? 'bg-amber-500/30' : 'bg-emerald-500/30'
        }`} />

        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 backdrop-blur-xl border shadow-xl ${
          isEmergency 
            ? 'bg-rose-500/20 border-rose-400/40 animate-pulse' 
            : isYellow 
              ? 'bg-amber-500/20 border-amber-400/40' 
              : 'bg-emerald-500/20 border-emerald-400/40'
        }`}>
          <span className="text-4xl filter drop-shadow-md">{config.icon}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
          {uiLanguage === 'hi' 
            ? config.labelHindi 
            : uiLanguage === 'en' 
            ? config.label 
            : result.level === 'RED' ? t('levelRed', uiLanguage) : result.level === 'YELLOW' ? t('levelYellow', uiLanguage) : t('levelGreen', uiLanguage)}
        </h2>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/10 border border-white/20 mb-2">
          {config.label}
        </div>
        <p className="text-base sm:text-lg font-medium text-slate-200 mt-1 max-w-md mx-auto">
          {uiLanguage === 'en' ? config.description : config.descriptionHindi}
        </p>

        {/* Immediate 108 Emergency Dial Action (For RED Level) */}
        {isEmergency && (
          <div className="mt-6 pt-5 border-t border-rose-500/30 max-w-md mx-auto">
            <a
              href="tel:108"
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.6)] text-base sm:text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <PhoneCall className="w-6 h-6 animate-bounce" />
              {t('emergency108', uiLanguage)}
            </a>
          </div>
        )}
      </div>

      {/* Structured Clinical Details Container */}
      <div className="bg-slate-900/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-6 sm:p-8 space-y-6 text-white">
        
        {/* ASHA Vitals Summary Pill Bar (in ASHA mode) */}
        {vitals && Object.values(vitals).some(v => v !== undefined && v !== '') && (
          <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                दर्ज शारीरिक माप (Recorded Vital Signs)
              </p>
              <span className="text-[10px] text-slate-400">Clinical Field Log</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              {vitals.temperature && (
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px]">बुखार (Temp)</span>
                  <span className="text-amber-300 text-sm">{vitals.temperature}°F</span>
                </div>
              )}
              {vitals.heartRate && (
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px]">नाड़ी (Pulse)</span>
                  <span className="text-rose-300 text-sm">{vitals.heartRate} bpm</span>
                </div>
              )}
              {vitals.bloodPressure && (
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px]">रक्तचाप (BP)</span>
                  <span className="text-cyan-300 text-sm">{vitals.bloodPressure}</span>
                </div>
              )}
              {vitals.oxygenLevel && (
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-slate-400 block text-[10px]">ऑक्सीजन (SpO2)</span>
                  <span className="text-emerald-300 text-sm">{vitals.oxygenLevel}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessment Reasons */}
        {result.reasons && result.reasons.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400" />
              {t('reasonsTitle', uiLanguage)}
            </h3>
            <ul className="space-y-2.5">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <p className="font-semibold text-slate-200 text-xs sm:text-sm leading-relaxed">{reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hindi & English Guidance Card with Voice Player */}
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {t('guidanceTitle', uiLanguage)}
            </h3>
            <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {t('audioAvailableBadge', uiLanguage)}
            </span>
          </div>

          <p className="text-base sm:text-lg font-medium text-emerald-100 leading-relaxed">
            {result.guidanceHindi}
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-normal">
            {result.guidance}
          </p>
          
          {result.audioBase64 && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <VoicePlayer audioBase64={result.audioBase64} />
            </div>
          )}
        </div>

        {/* Recommended Next Steps */}
        {result.nextSteps && result.nextSteps.length > 0 && (
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              {t('nextStepsTitle', uiLanguage)}
            </h3>
            <div className="space-y-2.5">
              {result.nextSteps.map((step, idx) => (
                <div key={idx} className="flex gap-3.5 items-center p-3.5 border border-slate-800 rounded-2xl bg-slate-950/60">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="font-semibold text-slate-200 text-xs sm:text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASHA Verification & Action Controls */}
        <div className="flex flex-col gap-3.5 pt-6 border-t border-white/10">
          {userMode === 'asha' ? (
            <>
              {isAshaVerified ? (
                <div className="p-4 bg-emerald-950/60 border-2 border-emerald-400/60 rounded-2xl flex items-center gap-3.5 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-white">{t('ashaVerifiedBadge', uiLanguage)}</p>
                    <p className="text-xs text-emerald-300">{t('ashaVerifiedSub', uiLanguage)}</p>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onAshaReview}
                  type="button"
                  className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                  {t('ashaVerifyBtn', uiLanguage)}
                </button>
              )}
            </>
          ) : (
            <div className="p-3.5 bg-slate-950/60 rounded-2xl text-center text-xs text-slate-400 border border-white/5">
              {t('patientNotice', uiLanguage)}
            </div>
          )}

          <button 
            onClick={onReset}
            type="button"
            className="w-full btn-secondary py-3.5 text-sm sm:text-base font-bold cursor-pointer"
          >
            {t('newCheckBtn', uiLanguage)}
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 pt-2 border-t border-white/5">
          {t('disclaimerResult', uiLanguage)}
        </p>
      </div>
    </div>
  );
};
