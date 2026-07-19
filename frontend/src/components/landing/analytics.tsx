'use client';

import { motion } from 'framer-motion';
import { Check, TrendingUp, Gauge, ShieldAlert } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';

const BULLETS = [
  'Incident trends and downtime broken down by unit and shift',
  'Machine-health scoring with predictive threshold alerts',
  'One-click compliance and audit reports for regulators',
];

const BARS = [
  { label: 'Mon', a: 62, b: 20 },
  { label: 'Tue', a: 78, b: 14 },
  { label: 'Wed', a: 54, b: 30 },
  { label: 'Thu', a: 84, b: 10 },
  { label: 'Fri', a: 72, b: 18 },
  { label: 'Sat', a: 90, b: 8 },
  { label: 'Sun', a: 68, b: 22 },
];

export function Analytics() {
  return (
    <section id="analytics" className="scroll-mt-24 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Analytics"
          title="Turn every shift into a decision"
          description="Live operational intelligence that turns raw log entries into the KPIs your leadership reviews every morning."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-3">
                <Kpi icon={TrendingUp} label="Production" value="+14.2%" tone="success" />
                <Kpi icon={Gauge} label="Downtime" value="-31%" tone="primary" />
                <Kpi icon={ShieldAlert} label="Incidents" value="3 open" tone="warning" />
              </div>
              <ul className="mt-2 space-y-3">
                {BULLETS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <p className="font-display text-sm font-semibold">
                    Weekly Output vs. Downtime
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Panipat Refinery · last 7 days
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Output
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" /> Downtime
                  </span>
                </div>
              </div>

              <div className="flex h-52 items-end justify-between gap-2 pt-6">
                {BARS.map((bar, i) => (
                  <div
                    key={bar.label}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-40 w-full items-end justify-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${bar.a}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="w-2.5 rounded-full bg-gradient-to-t from-indigo-500 to-violet-400 sm:w-3.5"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${bar.b}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.06 + 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="w-2.5 rounded-full bg-rose-400/80 sm:w-3.5"
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: 'success' | 'primary' | 'warning';
}) {
  const tones = {
    success: 'text-success bg-success/10',
    primary: 'text-primary bg-primary/10',
    warning: 'text-warning bg-warning/15',
  } as const;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card px-3.5 py-2.5 shadow-soft">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="font-display text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
