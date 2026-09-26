import React from 'react';
import { Activity, Thermometer, Heart, Gauge } from 'lucide-react';
import { VitalsState, UILanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface VitalsInputProps {
  vitals: VitalsState;
  uiLanguage?: UILanguage;
  onChange: (vitals: VitalsState) => void;
}

export const VitalsInput: React.FC<VitalsInputProps> = ({ vitals, uiLanguage = 'hi', onChange }) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-400/30 text-teal-300 flex items-center justify-center shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base sm:text-lg">{t('vitalsTitle', uiLanguage)}</h3>
            <p className="text-xs text-slate-400">{t('vitalsSub', uiLanguage)}</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
          {t('vitalsBadge', uiLanguage)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temperature */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              {t('tempLabel', uiLanguage)}
            </label>
            <span className="text-[9px] text-slate-400">{t('normalRangeTemp', uiLanguage)}</span>
          </div>
          <input
            type="number"
            step="0.1"
            placeholder="98.6"
            value={vitals.temperature || ''}
            onChange={(e) =>
              onChange({ ...vitals, temperature: e.target.value ? parseFloat(e.target.value) : undefined })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          />
        </div>

        {/* Heart Rate / Pulse */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              {t('pulseLabel', uiLanguage)}
            </label>
            <span className="text-[9px] text-slate-400">{t('normalRangePulse', uiLanguage)}</span>
          </div>
          <input
            type="number"
            placeholder="72"
            value={vitals.heartRate || ''}
            onChange={(e) =>
              onChange({ ...vitals, heartRate: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 transition-all"
          />
        </div>

        {/* Blood Pressure */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              {t('bpLabel', uiLanguage)}
            </label>
            <span className="text-[9px] text-slate-400">{t('normalRangeBP', uiLanguage)}</span>
          </div>
          <input
            type="text"
            placeholder="120/80"
            value={vitals.bloodPressure || ''}
            onChange={(e) =>
              onChange({ ...vitals, bloodPressure: e.target.value || undefined })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Oxygen SpO2 */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {t('oxygenLabel', uiLanguage)}
            </label>
            <span className="text-[9px] text-slate-400">{t('normalRangeO2', uiLanguage)}</span>
          </div>
          <input
            type="number"
            placeholder="98"
            value={vitals.oxygenLevel || ''}
            onChange={(e) =>
              onChange({ ...vitals, oxygenLevel: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
