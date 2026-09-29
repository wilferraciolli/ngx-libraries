import { Injectable } from '@angular/core';
import { Temporal } from 'temporal-polyfill';
import type { DateTimeDisambiguation } from '../constants/date-time.constants';
import { parseInstant } from '../utils/date-time.utils';

export interface ZonedInstantResult {
  instant: string;          // UTC instant, Eg '2024-03-31T01:30:00Z'
  notice: string | null;    // Set when the wall-clock time fell in a DST gap or overlap
}

/**
 * Bridges UTC instants and the JS `Date`s that Angular Material pickers work with.
 *
 * A picker `Date` is treated as a wall-clock value: its local getters (getFullYear, getHours, ...)
 * hold the date and time as seen in `timeZone`, not in the browser's own timezone.
 */
@Injectable({ providedIn: 'root' })
export class ZonedDateTimeService {
  /** UTC instant -> `Date` whose local fields show the wall-clock time in `timeZone`. */
  public toDate(instant: string | null | undefined, timeZone: string): Date | null {
    const zoned = this.toZoned(instant, timeZone);
    if (!zoned) {
      return null;
    }

    // Can be off by an hour only inside the browser's own DST gap, where JS Date can't hold that time.
    return new Date(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute);
  }

  /** Wall-clock date + time in `timeZone` -> UTC instant, resolving DST gaps and overlaps explicitly. */
  public toInstant(
    date: Date,
    time: Date,
    timeZone: string,
    disambiguation: DateTimeDisambiguation = 'earlier'
  ): ZonedInstantResult | null {
    try {
      const plainDateTime = Temporal.PlainDateTime.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: time.getHours(),
        minute: time.getMinutes()
      });
      const earlier = plainDateTime.toZonedDateTime(timeZone, { disambiguation: 'earlier' });
      const later = plainDateTime.toZonedDateTime(timeZone, { disambiguation: 'later' });

      if (earlier.equals(later)) {
        return { instant: earlier.toInstant().toString(), notice: null };
      }

      const isGap = !earlier.toPlainDateTime().equals(plainDateTime);
      if (isGap) {
        return {
          instant: later.toInstant().toString(),
          notice: `${formatWallClock(plainDateTime)} does not exist in ${timeZone} (clocks go forward). `
            + `Using ${formatWallClock(later.toPlainDateTime())} (UTC${later.offset}) instead.`
        };
      }

      const chosen = disambiguation === 'later' ? later : earlier;
      return {
        instant: chosen.toInstant().toString(),
        notice: `${formatWallClock(plainDateTime)} happens twice in ${timeZone} (clocks go back). `
          + `Using the ${chosen === earlier ? 'first' : 'second'} occurrence (UTC${chosen.offset}).`
      };
    } catch {
      return null;
    }
  }

  /** UTC offset of `instant` in `timeZone`, Eg '+01:00', or null when either is invalid. */
  public offset(instant: string | null | undefined, timeZone: string): string | null {
    return this.toZoned(instant, timeZone)?.offset ?? null;
  }

  private toZoned(instant: string | null | undefined, timeZone: string): Temporal.ZonedDateTime | null {
    try {
      return parseInstant(instant)?.toZonedDateTimeISO(timeZone) ?? null;
    } catch {
      // invalid timezone id
      return null;
    }
  }
}

function formatWallClock(plainDateTime: Temporal.PlainDateTime): string {
  return plainDateTime.toString({ smallestUnit: 'minute' }).replace('T', ' ');
}
