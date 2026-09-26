import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoicePlayerProps {
  audioBase64: string;
  label?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ audioBase64, label = 'ऑडियो सुनें (Listen Hindi Guidance)' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioBase64) {
      try {
        const binaryString = window.atob(audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error('Failed to parse audioBase64', e);
      }
    }
  }, [audioBase64]);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      setAudioRef(audio);

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef) return;
    
    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setIsPlaying(false);
      });
    }
  };

  if (!audioBase64) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-medium">
        <Volume2 className="w-4 h-4 opacity-50" />
        <span>Audio guidance currently unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          onClick={togglePlay}
          type="button"
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isPlaying 
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-xs sm:text-sm">
              {isPlaying ? 'आवाज़ चल रही है...' : label}
            </p>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sarvam AI
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {isPlaying ? 'रोकने के लिए दोबारा दबाएं' : 'स्पष्ट हिंदी में सुनने के लिए प्ले करें'}
          </p>
        </div>
      </div>

      {/* Animated Equalizer Wave Bars when playing */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto h-7 px-3 py-1 rounded-xl bg-slate-950/60 border border-white/5">
        <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-400 animate-equalizer-1' : 'bg-slate-600 h-2'}`}></span>
        <span className={`w-1 rounded-full ${isPlaying ? 'bg-teal-400 animate-equalizer-2' : 'bg-slate-600 h-3.5'}`}></span>
        <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-300 animate-equalizer-3' : 'bg-slate-600 h-5'}`}></span>
        <span className={`w-1 rounded-full ${isPlaying ? 'bg-cyan-400 animate-equalizer-2' : 'bg-slate-600 h-2'}`}></span>
        <span className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-400 animate-equalizer-1' : 'bg-slate-600 h-4'}`}></span>
      </div>
    </div>
  );
};
