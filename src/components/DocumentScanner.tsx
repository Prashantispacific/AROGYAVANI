import React, { useRef, useState } from 'react';
import { Camera, RotateCcw, Sparkles, FileText, CheckCircle2, ScanLine, Copy, Check } from 'lucide-react';
import { sendScan } from '@/lib/api';
import { UILanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface DocumentScannerProps {
  onScanComplete: (text: string) => void;
  isProcessing: boolean;
  uiLanguage?: UILanguage;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete, isProcessing, uiLanguage = 'hi' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [scannedText, setScannedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB (फ़ाइल 10MB से छोटी होनी चाहिए)');
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setLocalProcessing(true);

    try {
      const response = await sendScan(file);
      setScannedText(response.extractedText);
      onScanComplete(response.extractedText);
    } catch (err: any) {
      setError(err.message || 'दस्तावेज़ स्कैन करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLocalProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDemoPrescription = async () => {
    try {
      setError(null);
      setLocalProcessing(true);
      const res = await fetch('/samples/sample-prescription.png');
      const blob = await res.blob();
      const file = new File([blob], 'sample-prescription.png', { type: 'image/png' });
      await processFile(file);
    } catch (err: any) {
      setError('डेमो पर्चा लोड करने में विफल: ' + (err.message || ''));
      setLocalProcessing(false);
    }
  };

  const handleRetake = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    setScannedText('');
    onScanComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (newText: string) => {
    setScannedText(newText);
    onScanComplete(newText);
  };

  const handleCopy = () => {
    if (!scannedText) return;
    navigator.clipboard.writeText(scannedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBusy = isProcessing || localProcessing;

  if (preview) {
    return (
      <div className="flex flex-col items-center animate-fade-in w-full max-w-xl mx-auto space-y-5">
        {/* Document Preview with Laser Scan Effect */}
        <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700/80">
          <img src={preview} alt="Document preview" className="w-full h-full object-contain bg-slate-950 p-2" />
          
          {/* Laser Scanning Bar */}
          {isBusy && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              {/* Laser line animation */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-scan-laser"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 relative">
                <ScanLine className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <p className="font-bold text-white text-lg tracking-tight">
                {uiLanguage === 'hi' ? 'AI पर्चा पढ़ रहा है...' : uiLanguage === 'bn' ? 'AI প্রেসক্রিপশন পড়ছে...' : uiLanguage === 'te' ? 'AI ప్రిస్క్రిప్షన్ చదువుతోంది...' : uiLanguage === 'mr' ? 'AI प्रिस्क्रिप्शन वाचत आहे...' : 'AI scanning document...'}
              </p>
              <p className="text-xs text-emerald-300 mt-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Extracting medications, patient vitals & instructions...
              </p>
            </div>
          )}
        </div>

        {/* Digitized text review & edit box */}
        {!isBusy && scannedText && (
          <div className="w-full text-left bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-emerald-500/30 shadow-2xl animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {t('docExtractedTitle', uiLanguage)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? t('copiedBtn', uiLanguage) : t('copyBtn', uiLanguage)}
                </button>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  {uiLanguage === 'hi' ? 'आवश्यकतानुसार सुधारें' : uiLanguage === 'en' ? 'Edit if needed' : 'Edit if needed'}
                </span>
              </div>
            </div>

            <textarea
              value={scannedText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={4}
              placeholder={uiLanguage === 'hi' ? 'निकाला गया टेक्स्ट यहाँ दिखाई देगा...' : 'Digitized extracted text will appear here...'}
              className="w-full p-3.5 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white font-mono text-xs sm:text-sm focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:outline-none transition-all resize-y"
            />
          </div>
        )}

        {/* Action Controls below preview */}
        <div className="flex flex-wrap items-center justify-between w-full gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetake}
            disabled={isBusy}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            {t('retakeBtn', uiLanguage)}
          </button>

          {!isBusy && (
            <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {t('docDigitizedBadge', uiLanguage)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="w-full p-4 bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-lg">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-bold ml-2 cursor-pointer">&times;</button>
        </div>
      )}

      {/* Main Upload Dropzone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full p-8 sm:p-10 rounded-3xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-slate-900/60 hover:bg-slate-850/70 backdrop-blur-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 shadow-xl group hover:shadow-2xl relative overflow-hidden"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
          <Camera className="w-10 h-10 text-emerald-400 drop-shadow-md" />
        </div>
        
        <div className="text-center space-y-1">
          <p className="font-bold text-white text-base sm:text-lg">{t('scannerDropzoneTitle', uiLanguage)}</p>
          <p className="text-slate-300 text-xs sm:text-sm">{t('scannerDropzoneSub', uiLanguage)}</p>
          <p className="text-slate-500 text-[11px] pt-1">{t('scannerFormats', uiLanguage)}</p>
        </div>
      </div>

      {/* One-Click Sample Prescription Demo */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={handleDemoPrescription}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900/90 hover:from-emerald-900/90 hover:to-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-lg hover:shadow-emerald-950/50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <FileText className="w-4 h-4 text-teal-400" />
          {t('samplePrescriptionBtn', uiLanguage)}
        </button>
      </div>
    </div>
  );
};
