import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { Button } from '@/components/ui/button';

export function Cta() {
  return (
    <section className="pb-24">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center shadow-glow-lg sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
                Ready to retire the paper logbook?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                Join the operations teams running safer, smarter shifts with
                DigiLog. Start your free trial in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-white/90"
                >
                  <Link href="/register">
                    Start free trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="#pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
