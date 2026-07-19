'use client';

import { Reveal } from '@/components/landing/reveal';

const CLIENTS = [
  'IOCL',
  'HPCL',
  'BPCL',
  'ONGC',
  'NTPC',
  'Tata Steel',
  'Reliance',
  'GAIL',
];

export function Clients() {
  return (
    <section className="border-y bg-muted/20 py-12">
      <div className="container">
        <Reveal className="text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by operations teams across India&apos;s industrial backbone
          </p>
        </Reveal>
        <div className="relative mt-8 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-16">
            {CLIENTS.map((name) => (
              <span
                key={name}
                className="font-display text-xl font-bold tracking-tight text-muted-foreground/70 grayscale transition hover:text-foreground hover:grayscale-0 sm:text-2xl"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
