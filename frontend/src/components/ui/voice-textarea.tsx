'use client';

import * as React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { cn } from '@/lib/utils';

interface VoiceTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A Textarea with an inline dictation button. Speech is appended to the
 * existing value (not replacing it), so an operator can type some of a
 * field and dictate the rest. Falls back to a plain Textarea with no mic
 * button on browsers without SpeechRecognition support (Safari, Firefox).
 */
export const VoiceTextarea = React.forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  ({ value, onChange, className, disabled, ...props }, ref) => {
    const valueRef = React.useRef(value);
    valueRef.current = value;

    const { isSupported, isListening, interimTranscript, error, start, stop } = useSpeechToText({
      onFinalResult: (text) => {
        if (!text) return;
        const current = valueRef.current;
        onChange(current && !current.endsWith(' ') ? `${current} ${text}` : `${current}${text}`);
      },
    });

    React.useEffect(() => {
      if (error) toast.error(error);
    }, [error]);

    return (
      <div className="relative">
        <Textarea
          ref={ref}
          value={isListening && interimTranscript ? `${value} ${interimTranscript}` : value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(isSupported && 'pr-11', className)}
          {...props}
        />
        {isSupported && (
          <button
            type="button"
            onClick={() => (isListening ? stop() : start())}
            disabled={disabled}
            title={isListening ? 'Stop dictating' : 'Dictate with your voice'}
            aria-label={isListening ? 'Stop dictating' : 'Dictate with your voice'}
            className={cn(
              'absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full transition-colors',
              isListening
                ? 'animate-pulse bg-destructive text-destructive-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              disabled && 'pointer-events-none opacity-50'
            )}
          >
            {isListening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    );
  }
);
VoiceTextarea.displayName = 'VoiceTextarea';
