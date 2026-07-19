'use client';

import * as React from 'react';
import {
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  motion,
} from 'framer-motion';

interface CounterProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Animated statistics counter that runs once when scrolled into view.
 */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
}: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const motionValue = useMotionValue(from);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });
  const display = useTransform(spring, (current) =>
    `${prefix}${current.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`
  );

  React.useEffect(() => {
    if (inView) motionValue.set(to);
  }, [inView, to, motionValue]);

  return <motion.span ref={ref}>{display}</motion.span>;
}
