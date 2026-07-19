import { FileEdit, Send, ShieldCheck, Archive } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { ShiftLogStatus } from '@/types/shift-log';

const CONFIG: Record<
  ShiftLogStatus,
  { label: string; variant: NonNullable<BadgeProps['variant']>; icon: React.ComponentType<{ className?: string }> }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: FileEdit },
  SUBMITTED: { label: 'Submitted', variant: 'warning', icon: Send },
  SIGNED: { label: 'Signed', variant: 'success', icon: ShieldCheck },
  ARCHIVED: { label: 'Archived', variant: 'outline', icon: Archive },
};

export function ShiftLogStatusBadge({ status }: { status: ShiftLogStatus }) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
