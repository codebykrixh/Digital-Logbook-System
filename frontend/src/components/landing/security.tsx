import {
  Lock,
  KeyRound,
  FileCheck2,
  Server,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';

const ITEMS = [
  { icon: Lock, title: 'Encryption everywhere', desc: 'TLS in transit and AES-256 at rest for all logs and attachments.' },
  { icon: KeyRound, title: 'JWT + refresh tokens', desc: 'Short-lived access tokens with rotating, revocable refresh tokens.' },
  { icon: Fingerprint, title: 'Optional MFA', desc: 'Time-based one-time passwords for privileged Admin and Manager roles.' },
  { icon: FileCheck2, title: 'Immutable audit logs', desc: 'Tamper-evident records of every create, update, and delete.' },
  { icon: Server, title: 'Hardened APIs', desc: 'Helmet, CORS, rate limiting, and strict input validation with Zod.' },
  { icon: ShieldCheck, title: 'Injection defense', desc: 'Parameterized queries via Prisma plus XSS and CSRF protection.' },
];

export function Security() {
  return (
    <section id="security" className="scroll-mt-24 bg-muted/20 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Security"
          title="Enterprise security, engineered in from day one"
          description="Built to satisfy the compliance and audit demands of refineries, power plants, and critical infrastructure."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-2xl border bg-card p-5 shadow-soft transition-colors hover:border-primary/30">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-background shadow-soft">
                  <it.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{it.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {it.desc}
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
