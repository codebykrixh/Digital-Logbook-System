'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { IncidentTrendPoint } from '@/types/analytics';

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

export function IncidentTrendChart({ data }: { data: IncidentTrendPoint[] }) {
  const chartData = data.map((d) => ({ ...d, label: formatDay(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="incidentArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 12,
            fontSize: 12,
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Incidents"
          stroke="hsl(243 75% 59%)"
          strokeWidth={2.5}
          fill="url(#incidentArea)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
