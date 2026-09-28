import { Temporal } from 'temporal-polyfill';

/** Parses a UTC instant string, returning null instead of throwing for empty/invalid input. */
export function parseUtcInstant(value: string | null | undefined): Temporal.Instant | null {
  if (!value) {
    return null;
  }

  try {
    return Temporal.Instant.from(value);
  } catch {
    return null;
  }
}
