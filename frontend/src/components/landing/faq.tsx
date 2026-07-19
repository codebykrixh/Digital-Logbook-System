import { Reveal } from '@/components/landing/reveal';
import { SectionHeading } from '@/components/landing/section-heading';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'How long does it take to deploy DigiLog?',
    a: 'Most single-plant deployments are live within a day. DigiLog ships with Docker Compose for self-hosting, and managed cloud onboarding for larger operators takes about a week including RBAC and data migration.',
  },
  {
    q: 'Can DigiLog run on-premise or in an air-gapped environment?',
    a: 'Yes. The entire stack — Next.js frontend, Node/Express API, PostgreSQL, and Redis — is containerized and can run fully on-premise or in a private cloud with no external dependencies.',
  },
  {
    q: 'How does DigiLog handle roles and permissions?',
    a: 'DigiLog uses role-based access control with four built-in roles — Operator, Supervisor, Manager, and Admin — plus granular permissions. Admins can restrict modules, plants, and actions per role.',
  },
  {
    q: 'Is our operational data secure and auditable?',
    a: 'Absolutely. Data is encrypted in transit and at rest, every action is captured in an immutable audit log, and privileged accounts can require MFA. You retain full ownership and export rights.',
  },
  {
    q: 'Can we export logs and reports for regulators?',
    a: 'Shift logs, handovers, incidents, and compliance reports can be exported to PDF and Excel on demand, complete with digital signatures and full audit trails.',
  },
  {
    q: 'Does it work on mobile devices in the field?',
    a: 'Yes. DigiLog is fully responsive and optimized for tablets and phones, so operators can log entries and raise incidents directly from the plant floor.',
  },
];

export function Faq() {
  return (
    <section className="py-24">
      <div className="container max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Everything you need to know about deploying and running DigiLog."
        />
        <Reveal className="mt-12">
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
