import {
  UserCog,
  ClipboardList,
  CalendarClock,
  AlertTriangle,
  Repeat,
  LineChart,
} from 'lucide-react';
import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';
import { Badge } from '@/components/ui/badge';

const MODULES = [
  {
    n: '01',
    icon: UserCog,
    title: 'Authentication & RBAC',
    desc: 'JWT sessions, refresh tokens, optional MFA, and four roles — Operator, Supervisor, Manager, Admin — with granular permissions.',
    points: ['Email verification', 'Session management', 'Activity log'],
  },
  {
    n: '02',
    icon: ClipboardList,
    title: 'Digital Shift Logbook',
    desc: 'Create, edit, and search structured shift entries with equipment readings, safety notes, attachments, and a beautiful timeline.',
    points: ['Autosave & drafts', 'Advanced filters', 'CSV / PDF export'],
  },
  {
    n: '03',
    icon: CalendarClock,
    title: 'Operational Events',
    desc: 'Record routine, maintenance, and emergency events with priorities, attachments, comment threads, and @mentions.',
    points: ['Image & document upload', 'Status history', 'Mentions'],
  },
  {
    n: '04',
    icon: AlertTriangle,
    title: 'Incident Management',
    desc: 'End-to-end incident workflow with severity, CAPA, root-cause analysis, escalation, approvals, and email alerts.',
    points: ['CAPA & RCA', 'Escalation matrix', 'Approval workflow'],
  },
  {
    n: '05',
    icon: Repeat,
    title: 'Shift Handover',
    desc: 'Auto-generated summaries of pending work and outstanding incidents, with checklists, digital signatures, and PDF/Excel export.',
    points: ['Digital signature', 'Checklist', 'Preview & history'],
  },
  {
    n: '06',
    icon: LineChart,
    title: 'Analytics & Reports',
    desc: 'Executive dashboards with incident trends, downtime, machine health, heat maps, and compliance reports with a full audit trail.',
    points: ['KPI dashboards', 'Heat maps', 'Compliance reports'],
  },
];

export function Modules() {
  return (
    <section id="modules" className="scroll-mt-24 bg-muted/20 py-24">
      <div className="container">
        <SectionHeading
          eyebrow="Modules"
          title="Six modules that cover the entire operations lifecycle"
          description="From the moment an operator signs in to the executive board review — DigiLog has a purpose-built module for every step."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.n} delay={(i % 3) * 0.08}>
              <div className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <div className="inline-flex rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2.5 shadow-glow">
                    <m.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-mono text-sm font-semibold text-muted-foreground/50">
                    {m.n}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {m.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {m.desc}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.points.map((p) => (
                    <Badge key={p} variant="secondary" className="font-normal">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
