import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, RotateCcw, Play, Pause, Loader2, Upload, AlertCircle, Sparkles, Volume2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { UILanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface VoiceButtonProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
  hasTranscript?: boolean;
  uiLanguage?: UILanguage;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  onRecordingComplete, 
  isProcessing, 
  hasTranscript = false,
  uiLanguage = 'hi'
}) => {
  const { 
    isRecording, 
    audioBlob, 
    duration, 
    error: recorderError, 
    clearError, 
    startRecording, 
    stopRecording, 
    reset 
  } = useAudioRecorder(30);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastProcessedBlobRef = useRef<Blob | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Safely trigger onRecordingComplete ONCE per recording
  useEffect(() => {
    if (audioBlob && audioBlob !== lastProcessedBlobRef.current) {
      lastProcessedBlobRef.current = audioBlob;
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      const url = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(url);
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete, currentAudioUrl]);

  // Click-to-toggle recording
  const handleToggleRecord = () => {
    if (isProcessing) return;
    clearError();
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Handle uploaded audio file (e.g. from WhatsApp, phone recorder)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);

    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    const url = URL.createObjectURL(file);
    setCurrentAudioUrl(url);
    lastProcessedBlobRef.current = file;
    onRecordingComplete(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle loading a demo sample audio
  const handleLoadSample = async (samplePath: string) => {
    if (isProcessing) return;
    clearError();
    try {
      const res = await fetch(samplePath);
      const blob = await res.blob();
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);

      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
      const url = URL.createObjectURL(blob);
      setCurrentAudioUrl(url);
      lastProcessedBlobRef.current = blob;
      onRecordingComplete(blob);
    } catch (err) {
      console.error('Failed to load sample audio:', err);
    }
  };

  const togglePlayback = () => {
    if (!currentAudioUrl) return;

    if (!audioRef.current) {
      const audio = new Audio(currentAudioUrl);
      audio.onended = () => setIsPlaying(false);
      audioRef.current = audio;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }
    lastProcessedBlobRef.current = null;
    setIsPlaying(false);
    clearError();
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 min-h-[260px] relative">
      {/* Hidden file input for audio upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Inline Microphone / Recorder Error Banner */}
      {recorderError && (
        <div className="w-full max-w-md mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left flex items-start gap-3 animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-200 leading-relaxed">{recorderError}</p>
          </div>
          <button 
            onClick={clearError}
            className="text-amber-400 hover:text-white text-base font-bold ml-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* State A: Currently transcribing speech via AI */}
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center animate-fade-in py-4">
          <div className="relative flex items-center justify-center">
            {/* Ambient Multi-Ring Glow */}
            <div className="absolute w-44 h-44 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-emerald-400/50 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative">
              <Loader2 className="w-16 h-16 text-emerald-400 animate-spin" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/20 animate-ping"></div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xl font-bold text-white tracking-tight">आवाज़ को समझा जा रहा है...</p>
            <p className="text-xs text-emerald-300 font-semibold mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Transcribing via Sarvam Saaras AI & translating...
            </p>
          </div>
        </div>
      ) : currentAudioUrl ? (
        /* State B: Recording / Audio ready with Playback option */
        <div className="flex flex-col items-center justify-center animate-fade-in space-y-5 w-full max-w-md">
          <div className={`w-full flex items-center gap-4 p-4 rounded-3xl border shadow-xl backdrop-blur-xl transition-all ${
            hasTranscript 
              ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900/80 border-emerald-500/40 shadow-emerald-950/30' 
              : 'bg-gradient-to-r from-amber-950/60 to-slate-900/80 border-amber-500/40 shadow-amber-950/30'
          }`}>
            <button
              onClick={togglePlayback}
              type="button"
              className={`w-16 h-16 rounded-2xl text-white flex items-center justify-center transition-all shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 ${
                hasTranscript 
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-400' 
                  : 'bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-amber-500/30 hover:from-amber-500 hover:to-yellow-400'
              }`}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>
            <div className="text-left flex-1 pr-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  hasTranscript ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {hasTranscript ? 'Transcribed' : 'Recorded'}
                </span>
              </div>
              <p className="font-bold text-white text-sm sm:text-base mt-1">
                {hasTranscript ? t('transcribedSuccess', uiLanguage) : 'Audio Recorded'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                {hasTranscript ? t('tapToPlay', uiLanguage) : t('tapToSpeak', uiLanguage)}
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-all text-xs font-bold shadow-md cursor-pointer hover:text-white"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            {t('tryAgain', uiLanguage)}
          </button>
        </div>
      ) : (
        /* State C: Ready to Record Hero Core */
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Multi-layered Acoustic Ambient Halo */}
            <div
              className={`absolute w-52 h-52 rounded-full transition-all duration-500 pointer-events-none ${
                isRecording
                  ? 'bg-rose-500/30 scale-125 blur-2xl animate-pulse'
                  : 'bg-emerald-500/15 scale-100 blur-2xl'
              }`}
            />
            {isRecording && (
              <div className="absolute w-44 h-44 rounded-full border-2 border-rose-500/40 animate-ping pointer-events-none" />
            )}

            <button
              onClick={handleToggleRecord}
              type="button"
              className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 select-none cursor-pointer border-2
                ${
                  isRecording
                    ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 border-rose-300/80 scale-105 shadow-[0_0_50px_rgba(244,63,94,0.6)]'
                    : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:to-teal-400 hover:scale-105 active:scale-95 border-emerald-300/60 shadow-[0_15px_40px_-5px_rgba(16,185,129,0.5),inset_0_2px_0_rgba(255,255,255,0.4)] ring-8 ring-emerald-500/15'
                }
              `}
            >
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <Square className="w-12 h-12 text-white drop-shadow-md mb-1" fill="currentColor" />
                  {/* Live Soundwave Simulation Bars */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1 h-3 bg-white rounded-full animate-equalizer-1"></span>
                    <span className="w-1 h-5 bg-white rounded-full animate-equalizer-2"></span>
                    <span className="w-1 h-2 bg-white rounded-full animate-equalizer-3"></span>
                    <span className="w-1 h-4 bg-white rounded-full animate-equalizer-1"></span>
                  </div>
                </div>
              ) : (
                <Mic className="w-16 h-16 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] transform group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
          
          <div className="mt-6 text-center min-h-[3.8rem]">
            {isRecording ? (
              <div className="animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  {t('recordingBadge', uiLanguage)}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {Math.floor(duration)}s <span className="text-rose-400 font-normal text-sm">/ 30s</span>
                </p>
                <p className="text-xs text-rose-200/90 mt-0.5 font-medium">{t('tapToStop', uiLanguage)}</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{t('tapToSpeak', uiLanguage)}</p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 font-medium">{t('clickToRecordSub', uiLanguage)}</p>
              </div>
            )}
          </div>

          {/* Quick Fallback Options: Audio File Upload & Demo Voice Samples */}
          {!isRecording && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 pt-4 border-t border-white/10 w-full max-w-lg">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/70 text-xs font-semibold transition-all shadow-sm cursor-pointer"
                title="Upload recorded audio file (.mp3, .wav, .m4a)"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                {t('uploadAudio', uiLanguage)}
              </button>

              <span className="text-xs text-slate-400 font-semibold">{t('orDemo', uiLanguage)}</span>

              <button
                type="button"
                onClick={() => handleLoadSample('/samples/sample-fever.wav')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                {t('sampleFever', uiLanguage)}
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('/samples/sample-emergency.wav')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {t('sampleEmergency', uiLanguage)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

