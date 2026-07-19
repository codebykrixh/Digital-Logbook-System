'use client';

import * as React from 'react';

interface UseSpeechToTextOptions {
  lang?: string;
  onFinalResult: (transcript: string) => void;
}

interface UseSpeechToTextResult {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: { isFinal: boolean; [altIndex: number]: { transcript: string } };
  };
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access was denied. Allow it in your browser settings to dictate.',
  'no-speech': "Didn't catch that — try speaking again.",
  'audio-capture': 'No microphone was found on this device.',
  network: 'Network error during speech recognition. Check your connection.',
};

/**
 * Wraps the browser's native Web Speech API (Chrome/Edge only — Safari and
 * Firefox don't implement SpeechRecognition, so isSupported gates the UI).
 * Lets plant operators dictate notes instead of typing, reducing manual
 * data-entry errors on the floor.
 */
export function useSpeechToText({
  lang = 'en-IN',
  onFinalResult,
}: UseSpeechToTextOptions): UseSpeechToTextResult {
  const [isListening, setIsListening] = React.useState(false);
  const [interimTranscript, setInterimTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
  const onFinalResultRef = React.useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const Ctor = React.useMemo(() => getSpeechRecognitionCtor(), []);
  const isSupported = Ctor !== null;

  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = React.useCallback(() => {
    if (!Ctor || isListening) return;
    setError(null);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result || !result[0]) continue;
        const text = result[0].transcript;
        if (result.isFinal) {
          onFinalResultRef.current(text.trim());
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      setError(ERROR_MESSAGES[event.error] ?? 'Speech recognition failed. Try again.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [Ctor, lang, isListening]);

  const stop = React.useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, interimTranscript, error, start, stop };
}
