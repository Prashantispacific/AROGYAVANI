import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { UILanguage } from '@/lib/types';
import { LANGUAGE_OPTIONS, LanguageOption } from '@/lib/i18n';

interface LanguageSelectorProps {
  currentLanguage: UILanguage;
  onLanguageChange: (lang: UILanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption: LanguageOption = LANGUAGE_OPTIONS.find((opt) => opt.code === currentLanguage) ?? LANGUAGE_OPTIONS[0]!;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Compact Language Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all text-xs font-bold shadow-sm cursor-pointer select-none"
        title="Switch UI Language • भाषा बदलें"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold text-xs tracking-tight">{selectedOption.native}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-950/95 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 p-1.5 animate-scale-up">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 border-b border-white/5 mb-1">
            Choose Language / भाषा चुनें
          </div>

          <div className="space-y-0.5">
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = option.code === currentLanguage;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(option.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{option.flag}</span>
                    <span className="font-bold">{option.native}</span>
                    <span className="text-[10px] text-slate-400">({option.label})</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
