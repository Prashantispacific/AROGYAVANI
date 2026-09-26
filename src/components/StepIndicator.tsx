import React from 'react';
import { Check, Mic, FileText, ClipboardCheck } from 'lucide-react';
import { AppStep, UILanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface StepIndicatorProps {
  currentStep: AppStep;
  uiLanguage?: UILanguage;
  onSelectStep?: (step: AppStep) => void;
}

const STEP_ITEMS = [
  { id: 'speak' as const, icon: Mic, number: '01' },
  { id: 'scan' as const, icon: FileText, number: '02' },
  { id: 'result' as const, icon: ClipboardCheck, number: '03' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, uiLanguage = 'hi', onSelectStep }) => {
  const currentIndex = STEP_ITEMS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto pt-4 sm:pt-6 pb-2 px-4">
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/10">
        <div className="flex items-center justify-between relative px-2 sm:px-6">
          {/* Background Track Line */}
          <div className="absolute left-10 right-10 top-6 sm:top-7 transform -translate-y-1/2 h-1 bg-slate-800/80 z-0 rounded-full"></div>
          
          {/* Active Glowing Track Line */}
          <div 
            className="absolute left-10 top-6 sm:top-7 transform -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 z-0 transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.7)]"
            style={{ width: `${(currentIndex / (STEP_ITEMS.length - 1)) * 80}%` }}
          ></div>

          {STEP_ITEMS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isClickable = Boolean(onSelectStep && (isCompleted || isCurrent) && step.id !== 'result');
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep?.(step.id)}
                className={`relative z-10 flex flex-col items-center group transition-all duration-200 ${
                  isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
              >
                <div 
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                      : isCurrent 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-110' 
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                  ) : (
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>

                <div className="mt-2.5 text-center">
                  <span className={`text-[10px] tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${
                    isCurrent 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : isCompleted 
                        ? 'text-emerald-400/90' 
                        : 'text-slate-500'
                  }`}>
                    {step.number}
                  </span>
                  <p className={`text-xs sm:text-sm font-bold mt-1 ${
                    isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                  }`}>
                    {step.id === 'speak' ? t('step1_title', uiLanguage) : step.id === 'scan' ? t('step2_title', uiLanguage) : t('step3_title', uiLanguage)}
                  </p>
                  <p className={`text-[10px] font-medium hidden sm:block ${
                    isCurrent ? 'text-emerald-400' : isCompleted ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {step.id === 'speak' ? t('step1_sub', uiLanguage) : step.id === 'scan' ? t('step2_sub', uiLanguage) : t('step3_sub', uiLanguage)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
