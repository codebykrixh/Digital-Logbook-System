'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/services/admin.service';
import { ApiClientError } from '@/lib/api';

export function PlantsTab() {
  const queryClient = useQueryClient();
  const { data: plants, isLoading } = useQuery({
    queryKey: ['admin', 'plants'],
    queryFn: () => adminApi.listPlants(),
    select: (res) => res.data,
  });

  const update = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updatePlant(id, { isActive }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin', 'plants'] }),
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : 'Failed to update'),
  });

  if (isLoading) return <Skeleton className="h-32 w-full rounded-2xl" />;

  return (
    <div className="space-y-3">
      {(plants ?? []).map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-soft">
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.code}{p.location ? ` · ${p.location}` : ''}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Active
            <Switch checked={p.isActive} onCheckedChange={(checked) => update.mutate({ id: p.id, isActive: checked })} />
          </label>
        </div>
      ))}
    </div>
  );
}
