import { Reveal } from '@/components/landing/reveal';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border bg-accent/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-muted-foreground text-balance sm:text-lg',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
