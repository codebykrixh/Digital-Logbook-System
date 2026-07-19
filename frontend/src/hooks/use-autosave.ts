'use client';

import * as React from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

/**
 * Debounced autosave. Keys off a JSON snapshot of `data` rather than object
 * identity, so it only fires when the content actually changes — form
 * libraries like react-hook-form's `watch()` return a new object reference
 * on every render, which would otherwise retrigger the effect constantly.
 */
export function useAutosave<T>({
  data,
  onSave,
  delay = 1200,
  enabled = true,
}: UseAutosaveOptions<T>): AutosaveStatus {
  const [status, setStatus] = React.useState<AutosaveStatus>('idle');
  const snapshot = JSON.stringify(data);
  const isFirstRun = React.useRef(true);
  const dataRef = React.useRef(data);
  dataRef.current = data;

  React.useEffect(() => {
    if (!enabled) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    setStatus('idle');
    const timeout = setTimeout(() => {
      setStatus('saving');
      onSave(dataRef.current)
        .then(() => setStatus('saved'))
        .catch(() => setStatus('error'));
    }, delay);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, enabled, delay]);

  return status;
}
