'use client';

import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  Repeat,
  BarChart3,
  Settings,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: ClipboardList, label: 'Shift Logbook' },
  { icon: AlertTriangle, label: 'Incidents' },
  { icon: Repeat, label: 'Handover' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Admin' },
];

const STATS = [
  { label: 'Active Shifts', value: '24', delta: '+8%', up: true },
  { label: 'Open Incidents', value: '3', delta: '-40%', up: false },
  { label: 'Uptime', value: '99.2%', delta: '+0.4%', up: true },
  { label: 'CAPA Closed', value: '87%', delta: '+12%', up: true },
];

const ROWS = [
  { id: 'SL-4821', unit: 'Crude Unit A', op: 'R. Sharma', status: 'Signed', tone: 'success' },
  { id: 'SL-4820', unit: 'Boiler 3', op: 'A. Khan', status: 'Pending', tone: 'warning' },
  { id: 'SL-4819', unit: 'Compressor 2', op: 'M. Iyer', status: 'Signed', tone: 'success' },
  { id: 'SL-4818', unit: 'Reactor R-101', op: 'S. Verma', status: 'Review', tone: 'primary' },
];

export function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-glow-lg ring-1 ring-black/5">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="mx-auto hidden items-center gap-2 rounded-lg border bg-background/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
          <span className="h-2 w-2 rounded-full bg-success" />
          app.digilog.io/dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r bg-muted/20 p-3 md:flex">
          <div className="px-2 py-1.5">
            <Logo />
          </div>
          <div className="mt-3 space-y-0.5">
            {NAV.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm ${
                  item.active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          {/* Topbar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-semibold sm:text-base">
                Operations Overview
              </p>
              <p className="text-xs text-muted-foreground">
                Panipat Refinery · Shift B
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border bg-background px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
                <Search className="h-3.5 w-3.5" />
                Search…
                <kbd className="rounded border bg-muted px-1 text-[10px]">⌘K</kbd>
              </div>
              <div className="relative grid h-8 w-8 place-items-center rounded-lg border bg-background">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
              </div>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
                RS
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border bg-background p-3">
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <div className="mt-1 flex items-end justify-between">
                  <span className="font-display text-xl font-bold">
                    {s.value}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                      s.up ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {s.up ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {s.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + table */}
          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="rounded-xl border bg-background p-3 lg:col-span-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-medium">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  Production vs. Downtime
                </p>
                <span className="text-[11px] text-muted-foreground">7 days</span>
              </div>
              <MiniAreaChart />
            </div>

            <div className="rounded-xl border bg-background p-3 lg:col-span-2">
              <p className="mb-2 text-xs font-medium">Recent Shift Logs</p>
              <div className="space-y-1.5">
                {ROWS.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[11px] hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.unit}</p>
                      <p className="truncate text-muted-foreground">
                        {r.id} · {r.op}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${toneClass(
                        r.tone
                      )}`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function toneClass(tone: string) {
  switch (tone) {
    case 'success':
      return 'bg-success/10 text-success';
    case 'warning':
      return 'bg-warning/15 text-warning';
    default:
      return 'bg-primary/10 text-primary';
  }
}

function MiniAreaChart() {
  const points = [22, 30, 26, 42, 38, 55, 48, 62, 58, 72];
  const w = 320;
  const h = 96;
  const max = 80;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - (p / max) * h] as const);
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-24 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="mockArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(243 75% 59%)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(243 75% 59%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#mockArea)" />
      <polyline
        points={line}
        fill="none"
        stroke="hsl(243 75% 59%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
