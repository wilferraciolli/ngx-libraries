import { Temporal } from 'temporal-polyfill';

/** Wire formats this package accepts: a UTC instant string (`'2024-03-31T01:30:00Z'`), a `Date`, or a `Temporal.Instant` directly. */
export type InstantLike = string | Date | Temporal.Instant;

export function toInstant(value: InstantLike): Temporal.Instant {
  if (value instanceof Temporal.Instant) {
    return value;
  }
  if (value instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(value.getTime());
  }
  return Temporal.Instant.from(value);
}

/** One tier of the "time ago" ladder: the largest unit whose threshold the diff still fits under. */
interface RelativeTimeTier {
  unit: Intl.RelativeTimeFormatUnit;
  secondsPerUnit: number;
  /** Below this many seconds, this tier applies (Infinity for the last one). */
  thresholdSeconds: number;
  /** How often a live pipe should re-check while in this tier. */
  refreshMs: number;
}

const TIERS: RelativeTimeTier[] = [
  { unit: 'second', secondsPerUnit: 1, thresholdSeconds: 60, refreshMs: 1_000 },
  { unit: 'minute', secondsPerUnit: 60, thresholdSeconds: 3_600, refreshMs: 30_000 },
  { unit: 'hour', secondsPerUnit: 3_600, thresholdSeconds: 86_400, refreshMs: 60_000 },
  { unit: 'day', secondsPerUnit: 86_400, thresholdSeconds: 86_400 * 7, refreshMs: 3_600_000 },
  { unit: 'week', secondsPerUnit: 86_400 * 7, thresholdSeconds: 86_400 * 30, refreshMs: 3_600_000 },
  { unit: 'month', secondsPerUnit: 86_400 * 30, thresholdSeconds: 86_400 * 365, refreshMs: 3_600_000 },
  { unit: 'year', secondsPerUnit: 86_400 * 365, thresholdSeconds: Infinity, refreshMs: 3_600_000 }
];

export interface RelativeTimeResult {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
  /** Milliseconds until this result's tier could change — a live display should re-check after this long. */
  refreshMs: number;
}

/** Picks the ladder tier for `diffSeconds` (can be negative — future values pick the same tiers). */
export function pickTier(diffSeconds: number): RelativeTimeResult {
  const absSeconds = Math.abs(diffSeconds);
  const tier = TIERS.find((t) => absSeconds < t.thresholdSeconds) ?? TIERS[TIERS.length - 1];
  return {
    value: Math.round(diffSeconds / tier.secondsPerUnit),
    unit: tier.unit,
    refreshMs: tier.refreshMs
  };
}
