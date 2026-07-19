import Link from 'next/link';
import { ShieldCheck, Activity, Users } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

/**
 * Split-screen authentication layout: a branded, glassy left panel and a
 * centered form area on the right. Collapses to a single column on mobile.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative">
          <Link href="/">
            <Logo wordmarkClassName="text-white" />
          </Link>
        </div>

        <div className="relative">
          <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-white">
            Run safer, smarter shifts — from control room to boardroom.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            DigiLog unifies shift logs, incidents, CAPA, and handovers in one
            secure platform trusted by industrial operations teams.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, text: 'Enterprise-grade security & audit trail' },
              { icon: Activity, text: 'Real-time incidents and live analytics' },
              { icon: Users, text: 'Role-based access for every operator' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} DigiLog · Smart Digital Logbook
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
