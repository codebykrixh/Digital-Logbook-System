import { cn } from '@/lib/utils';
import type { MachineHealthRow } from '@/types/analytics';

function healthColor(score: number) {
  if (score >= 80) return 'bg-success';
  if (score >= 50) return 'bg-warning';
  return 'bg-destructive';
}

export function MachineHealthTable({ data }: { data: MachineHealthRow[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No machines configured yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className="flex items-center gap-4 rounded-xl border bg-background p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{m.name}</p>
            <p className="text-xs text-muted-foreground">
              {m.tag} · {m.status} · {m.incidentCount} incident{m.incidentCount !== 1 ? 's' : ''} · {m.eventCount} event{m.eventCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-32 shrink-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Health</span>
              <span className="font-medium text-foreground">{m.healthScore}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all', healthColor(m.healthScore))} style={{ width: `${m.healthScore}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
