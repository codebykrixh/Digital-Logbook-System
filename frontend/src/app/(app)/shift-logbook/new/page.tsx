'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shiftLogApi } from '@/services/shift-log.service';
import { ApiClientError } from '@/lib/api';

/**
 * Creates a fresh draft immediately (Notion-style "new page") and hands off
 * to the detail/edit view, where autosave takes over from here.
 */
export default function NewShiftLogPage() {
  const router = useRouter();
  const created = React.useRef(false);

  React.useEffect(() => {
    if (created.current) return;
    created.current = true;

    shiftLogApi
      .create({
        shiftType: 'MORNING',
        shiftDate: new Date().toISOString().slice(0, 10),
      })
      .then(({ data }) => router.replace(`/shift-logbook/${data.id}`))
      .catch((err) => {
        toast.error(
          err instanceof ApiClientError ? err.message : 'Could not create shift log'
        );
        router.replace('/shift-logbook');
      });
  }, [router]);

  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Creating draft…</p>
      </div>
    </div>
  );
}
