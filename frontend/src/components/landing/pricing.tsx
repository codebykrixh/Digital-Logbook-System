'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/ 30-day trial',
    desc: 'For a single unit evaluating DigiLog.',
    cta: 'Start free trial',
    highlight: false,
    features: [
      'Up to 10 users',
      'Shift logbook & events',
      '1 plant / unit',
      'Community support',
      '30-day data retention',
    ],
  },
  {
    name: 'Professional',
    price: '₹4,999',
    period: '/ month',
    desc: 'For growing plants that need the full workflow.',
    cta: 'Get started',
    highlight: true,
    features: [
      'Up to 200 users',
      'All 6 modules included',
      'Unlimited plants & machines',
      'Incident + CAPA workflow',
      'Analytics & compliance reports',
      'Priority email support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For multi-site operators and refineries.',
    cta: 'Contact sales',
    highlight: false,
    features: [
      'Unlimited users',
      'SSO / SAML & advanced RBAC',
      'On-prem or private cloud',
      'Dedicated success manager',
      'Custom integrations & SLA',
      'Audit & regulatory support',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-muted/20 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          description="Start free, upgrade when you’re ready. No hidden fees, cancel anytime."
        />
        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-2xl border bg-card p-7 shadow-soft transition-all duration-300',
                  plan.highlight
                    ? 'border-primary/40 shadow-glow lg:-translate-y-3'
                    : 'hover:-translate-y-1 hover:shadow-card'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1 bg-primary text-primary-foreground shadow-glow">
                      <Sparkles className="h-3 w-3" /> Most popular
                    </Badge>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <Button
                  asChild
                  className="mt-6"
                  variant={plan.highlight ? 'gradient' : 'outline'}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
                <ul className="mt-6 space-y-3 border-t pt-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success/15">
                        <Check className="h-2.5 w-2.5 text-success" />
                      </span>
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
