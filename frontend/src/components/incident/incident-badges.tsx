import { Info, AlertCircle, AlertTriangle, Flame } from 'lucide-react';
import { CircleDot, UserCheck, PlayCircle, Search, CheckCircle2, Archive } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { IncidentSeverity, IncidentStatus } from '@/types/incident';

const SEVERITY: Record<IncidentSeverity, { label: string; variant: NonNullable<BadgeProps['variant']>; icon: typeof Info }> = {
  LOW: { label: 'Low', variant: 'secondary', icon: Info },
  MEDIUM: { label: 'Medium', variant: 'warning', icon: AlertCircle },
  HIGH: { label: 'High', variant: 'destructive', icon: AlertTriangle },
  CRITICAL: { label: 'Critical', variant: 'destructive', icon: Flame },
};

const STATUS: Record<IncidentStatus, { label: string; variant: NonNullable<BadgeProps['variant']>; icon: typeof Info }> = {
  OPEN: { label: 'Open', variant: 'secondary', icon: CircleDot },
  ASSIGNED: { label: 'Assigned', variant: 'secondary', icon: UserCheck },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning', icon: PlayCircle },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning', icon: Search },
  RESOLVED: { label: 'Resolved', variant: 'success', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', variant: 'outline', icon: Archive },
};

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const { label, variant, icon: Icon } = SEVERITY[severity];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const { label, variant, icon: Icon } = STATUS[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
