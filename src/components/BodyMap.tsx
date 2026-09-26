import React from 'react';
import { BODY_REGIONS } from '@/lib/constants';
import { Check, X } from 'lucide-react';
import { UILanguage } from '@/lib/types';
import { t, TranslationKey } from '@/lib/i18n';

interface BodyMapProps {
  selectedRegions: string[];
  uiLanguage?: UILanguage;
  onToggleRegion: (region: string) => void;
}

const REGION_KEY_MAP: Record<string, TranslationKey> = {
  head: 'head',
  chest: 'chest',
  stomach: 'stomach',
  'left-arm': 'leftArm',
  'right-arm': 'rightArm',
  'left-leg': 'leftLeg',
  'right-leg': 'rightLeg',
  back: 'back',
  'full-body': 'fullBody',
};

export const BodyMap: React.FC<BodyMapProps> = ({ selectedRegions, uiLanguage = 'hi', onToggleRegion }) => {
  return (
    <div className="w-full animate-fade-in">
      <div className="mb-4 text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">{t('bodyMapTitle', uiLanguage)}</h3>
        <p className="text-slate-300 text-xs sm:text-sm">{t('bodyMapSub', uiLanguage)}</p>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3.5">
        {BODY_REGIONS.map((region) => {
          const isSelected = selectedRegions.includes(region.id);
          
          return (
            <button
              key={region.id}
              type="button"
              onClick={() => onToggleRegion(region.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all min-h-[108px] touch-manipulation cursor-pointer select-none ${
                isSelected 
                  ? 'border-emerald-400 bg-gradient-to-b from-emerald-950/80 to-slate-900/90 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/40 transform scale-[1.02]' 
                  : 'border-white/10 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-850/80 shadow-md hover:shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full p-0.5 shadow-md">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
              )}
              <span className="text-3xl mb-1.5 filter drop-shadow-md transform group-hover:scale-110 transition-transform">
                {region.icon}
              </span>
              <span className="font-bold text-xs sm:text-sm text-white text-center leading-tight">
                {t(REGION_KEY_MAP[region.id] || 'head', uiLanguage)}
              </span>
              <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                {region.label}
              </span>
            </button>
          );
        })}
      </div>

      {selectedRegions.length > 0 && (
        <div className="mt-5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-emerald-300 mr-1">{t('selectedLabel', uiLanguage)}</span>
          {selectedRegions.map(id => {
            const region = BODY_REGIONS.find(r => r.id === id);
            if (!region) return null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggleRegion(id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                <span>{region.icon}</span>
                <span>{t(REGION_KEY_MAP[region.id] || 'head', uiLanguage)}</span>
                <X className="w-3 h-3 text-emerald-400 hover:text-white" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
