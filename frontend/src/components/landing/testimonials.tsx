import { Star, Quote } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';

const TESTIMONIALS = [
  {
    quote:
      'DigiLog cut our shift-handover time nearly in half and eliminated the “I didn’t know that was open” problem between crews. Our audit prep went from weeks to hours.',
    name: 'Rajesh Menon',
    role: 'Shift Manager, Refinery Operations',
    initials: 'RM',
  },
  {
    quote:
      'The incident workflow with CAPA and root-cause tracking is exactly what our HSE team needed. Escalations are automatic and nothing gets lost.',
    name: 'Ananya Deshpande',
    role: 'HSE Lead, Power Generation',
    initials: 'AD',
  },
  {
    quote:
      'We replaced three separate systems and a stack of paper logbooks. Operators actually enjoy using it — the mobile experience is superb.',
    name: 'Vikram Singh',
    role: 'Plant Head, Chemical Manufacturing',
    initials: 'VS',
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Operations leaders trust DigiLog"
          description="From control rooms to the boardroom — teams rely on DigiLog to run safer, more accountable shifts."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft">
                <Quote className="h-7 w-7 text-primary/25" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
