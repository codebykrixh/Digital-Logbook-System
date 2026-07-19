import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * DigiLog brand mark — a stylized logbook / signal glyph in a gradient tile.
 * Pure SVG so it is crisp at any size and needs no image asset.
 */
export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
}: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          'relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-glow',
          className
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          strokeWidth={2.2}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5.5A1.5 1.5 0 0 1 4 18.5Z" />
          <path d="M4 8h16M8 4v16" opacity={0.55} />
          <path d="m11.5 12.5 1.8 2 3-3.6" />
        </svg>
      </div>
      {showWordmark && (
        <span
          className={cn(
            'font-display text-lg font-bold tracking-tight',
            wordmarkClassName
          )}
        >
          Digi<span className="text-gradient">Log</span>
        </span>
      )}
    </div>
  );
}
