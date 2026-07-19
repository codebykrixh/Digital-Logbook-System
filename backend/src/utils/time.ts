const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parse a short duration string like "15m", "7d", "24h" into milliseconds.
 * Falls back to treating a bare number as milliseconds.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim());
  if (!match || !match[1] || !match[2]) {
    const asNum = Number(value);
    return Number.isFinite(asNum) ? asNum : 0;
  }
  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_MS;
  return amount * (UNIT_MS[unit] ?? 0);
}

export function futureDate(durationMs: number): Date {
  return new Date(Date.now() + durationMs);
}
