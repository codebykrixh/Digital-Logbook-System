'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { SeverityBreakdown } from '@/types/analytics';

const COLORS: Record<string, string> = {
  LOW: 'hsl(199 89% 60%)',
  MEDIUM: 'hsl(38 92% 55%)',
  HIGH: 'hsl(24 90% 55%)',
  CRITICAL: 'hsl(0 72% 55%)',
};
const ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function SeverityChart({ data }: { data: SeverityBreakdown[] }) {
  const chartData = ORDER.map((severity) => ({
    severity,
    count: data.find((d) => d.severity === severity)?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="severity" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={28} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
        />
        <Bar dataKey="count" name="Incidents" radius={[6, 6, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.severity} fill={COLORS[entry.severity]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
