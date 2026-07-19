import {
  ClipboardList,
  ShieldCheck,
  BarChart3,
  Bell,
  Repeat,
  Search,
  FileSignature,
  Zap,
} from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Structured shift logging',
    desc: 'Capture equipment status, temperature, pressure, and production notes with validated fields, drafts, and autosave — no more illegible handwriting.',
    className: 'lg:col-span-2',
    accent: 'from-indigo-500/20 to-transparent',
  },
  {
    icon: ShieldCheck,
    title: 'Audit-grade trail',
    desc: 'Every action is immutably logged with who, what, and when.',
    accent: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: Bell,
    title: 'Real-time alerts',
    desc: 'Socket-powered notifications the moment an incident is raised.',
    accent: 'from-rose-500/20 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Executive analytics',
    desc: 'Downtime, machine health, and shift performance in animated dashboards leaders actually read.',
    className: 'lg:col-span-2',
    accent: 'from-violet-500/20 to-transparent',
  },
  {
    icon: FileSignature,
    title: 'Digital signatures',
    desc: 'Sign-off handovers with tamper-evident e-signatures.',
    accent: 'from-amber-500/20 to-transparent',
  },
  {
    icon: Search,
    title: 'Command palette',
    desc: 'Jump anywhere in milliseconds with ⌘K search across logs, incidents, and people.',
    accent: 'from-sky-500/20 to-transparent',
  },
  {
    icon: Repeat,
    title: 'Automated handovers',
    desc: 'Summaries of pending work and open incidents are generated for you.',
    accent: 'from-fuchsia-500/20 to-transparent',
  },
  {
    icon: Zap,
    title: 'Fast by default',
    desc: 'Server components, caching, and code-splitting for sub-second loads.',
    accent: 'from-cyan-500/20 to-transparent',
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Platform"
          title={<>Everything an operations team needs, in one place</>}
          description="DigiLog unifies logging, incidents, handovers, and analytics — so nothing falls through the cracks between shifts."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 4) * 0.06}
              className={cn(f.className)}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div
                  className={cn(
                    'pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
                    f.accent
                  )}
                />
                <div className="relative">
                  <div className="inline-flex rounded-xl border bg-background p-2.5 shadow-soft">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
