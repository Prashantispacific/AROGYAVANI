import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  error: string | null;
  clearError: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;
}

export function useAudioRecorder(maxDuration = 30): AudioRecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeMimeTypeRef = useRef<string>('audio/webm');
  const recordStartTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('MediaRecorder stop error:', e);
      }
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording && duration >= maxDuration) {
      stopRecording();
    }
  }, [duration, maxDuration, isRecording, stopRecording]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startRecording = async () => {
    try {
      cleanup();
      setError(null);
      setAudioBlob(null);
      setDuration(0);
      chunksRef.current = [];
      recordStartTimeRef.current = Date.now();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('आपके ब्राउज़र में माइक्रोफ़ोन उपलब्ध नहीं है (Microphone not supported by browser)');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true } 
        });
      } catch (constraintErr) {
        console.warn('Preferred audio constraints failed, falling back to basic audio:', constraintErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }
      activeMimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const totalSize = chunksRef.current.reduce((acc, c) => acc + c.size, 0);
        const elapsed = (Date.now() - recordStartTimeRef.current) / 1000;

        if (totalSize < 500 || elapsed < 0.5) {
          setError('रिकॉर्डिंग बहुत छोटी थी। कृपया माइक दबाकर साफ़ आवाज़ में बोलें। (Recording too short. Please speak clearly.)');
          setAudioBlob(null);
        } else {
          const blob = new Blob(chunksRef.current, { type: activeMimeTypeRef.current });
          setAudioBlob(blob);
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            try { track.stop(); } catch (e) { /* ignore */ }
          });
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 0.1);
      }, 100);

    } catch (err: any) {
      console.error('Error starting audio recording:', err);
      setIsRecording(false);
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      const isNotFound = err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError';
      
      if (isDenied) {
        setError('माइक की अनुमति नहीं मिली (Microphone permission denied). कृपया ब्राउज़र सेटिंग में अनुमति दें या नीचे लक्षण लिखकर बताएं।');
      } else if (isNotFound) {
        setError('कोई माइक्रोफ़ोन नहीं मिला (No microphone detected). कृपया ऑडियो फ़ाइल अपलोड करें या नीचे लक्षण लिखकर बताएं।');
      } else {
        setError(`माइक त्रुटि: ${err.message || 'कृपया माइक अनुमति जांचें या नीचे लिखकर बताएं।'}`);
      }
    }
  };

  const reset = useCallback(() => {
    cleanup();
    setAudioBlob(null);
    setDuration(0);
    setError(null);
    setIsRecording(false);
    chunksRef.current = [];
  }, [cleanup]);

  return {
    isRecording,
    audioBlob,
    duration,
    error,
    clearError,
    startRecording,
    stopRecording,
    reset
  };
}
