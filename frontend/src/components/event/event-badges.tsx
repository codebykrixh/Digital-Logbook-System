import { Wrench, AlertTriangle, CircleDot, PlayCircle, CheckCircle2, Archive } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { EventPriority, EventStatus } from '@/types/event';

const PRIORITY: Record<EventPriority, { label: string; variant: NonNullable<BadgeProps['variant']>; icon: typeof Wrench }> = {
  ROUTINE: { label: 'Routine', variant: 'secondary', icon: CircleDot },
  MAINTENANCE: { label: 'Maintenance', variant: 'warning', icon: Wrench },
  EMERGENCY: { label: 'Emergency', variant: 'destructive', icon: AlertTriangle },
};

const STATUS: Record<EventStatus, { label: string; variant: NonNullable<BadgeProps['variant']>; icon: typeof Wrench }> = {
  OPEN: { label: 'Open', variant: 'secondary', icon: CircleDot },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning', icon: PlayCircle },
  RESOLVED: { label: 'Resolved', variant: 'success', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', variant: 'outline', icon: Archive },
};

export function EventPriorityBadge({ priority }: { priority: EventPriority }) {
  const { label, variant, icon: Icon } = PRIORITY[priority];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, variant, icon: Icon } = STATUS[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
