import { FileEdit, Send, CheckCircle2 } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { HandoverStatus } from '@/types/handover';

const CONFIG: Record<HandoverStatus, { label: string; variant: NonNullable<BadgeProps['variant']>; icon: typeof FileEdit }> = {
  DRAFT: { label: 'Draft', variant: 'secondary', icon: FileEdit },
  PENDING_ACK: { label: 'Awaiting acknowledgement', variant: 'warning', icon: Send },
  ACKNOWLEDGED: { label: 'Acknowledged', variant: 'success', icon: CheckCircle2 },
};

export function HandoverStatusBadge({ status }: { status: HandoverStatus }) {
  const { label, variant, icon: Icon } = CONFIG[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
