import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Modules', href: '#modules' },
      { label: 'Analytics', href: '#analytics' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'Security', href: '#security' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Compliance', href: '#' },
      { label: 'DPA', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The smart digital logbook for modern industrial operations. Log,
              track, and analyze every shift — securely.
            </p>
            <div className="mt-5 flex gap-2">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} DigiLog. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
