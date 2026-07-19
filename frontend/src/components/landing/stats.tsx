import { Counter } from '@/components/brand/counter';
import { Reveal } from '@/components/landing/reveal';

const STATS = [
  { to: 2.4, decimals: 1, suffix: 'M+', label: 'Log entries recorded' },
  { to: 99.98, decimals: 2, suffix: '%', label: 'Platform uptime SLA' },
  { to: 42, suffix: '%', label: 'Faster shift handovers' },
  { to: 180, suffix: '+', label: 'Plants & units onboarded' },
];

export function Stats() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="grid grid-cols-2 gap-6 rounded-3xl border bg-gradient-to-br from-card to-muted/30 p-8 shadow-card sm:p-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                <span className="text-gradient">
                  <Counter to={s.to} decimals={s.decimals} suffix={s.suffix} />
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
