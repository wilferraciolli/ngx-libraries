import { Injectable, inject } from '@angular/core';
import { Temporal } from 'temporal-polyfill';
import { NGX_DATES_LOCALE } from '../config/dates-locale.token';
import { InstantLike, pickTier, toInstant } from '../utils/relative-time.utils';

/**
 * "3 hours ago" / "in 2 days" text — for logic (a toast, a log line). Use the `relativeTime` pipe
 * instead in a template, which stays live as time passes and across a language switch without the
 * template needing to re-derive either itself.
 */
@Injectable({ providedIn: 'root' })
export class RelativeTimeService {
  private readonly resolveLocale = inject(NGX_DATES_LOCALE);

  /** `now` defaults to the real current instant — pass one explicitly only for tests. */
  public relativeTime(
    value: InstantLike,
    options?: Intl.RelativeTimeFormatOptions & { now?: InstantLike }
  ): string {
    const { now, ...formatOptions } = options ?? {};
    const target = toInstant(value);
    const reference = now ? toInstant(now) : Temporal.Now.instant();
    const diffSeconds = target.epochMilliseconds / 1000 - reference.epochMilliseconds / 1000;
    const { value: amount, unit } = pickTier(diffSeconds);

    return new Intl.RelativeTimeFormat(this.resolveLocale(), {
      numeric: 'auto',
      ...formatOptions
    }).format(amount, unit);
  }

  /** How soon `relativeTime(value)`'s displayed tier could next change — for a live pipe's own timer. */
  public refreshDelayMs(value: InstantLike, now?: InstantLike): number {
    const target = toInstant(value);
    const reference = now ? toInstant(now) : Temporal.Now.instant();
    const diffSeconds = target.epochMilliseconds / 1000 - reference.epochMilliseconds / 1000;
    return pickTier(diffSeconds).refreshMs;
  }
}
