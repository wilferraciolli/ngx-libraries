import { Temporal } from 'temporal-polyfill';

import type { CalendarEvent } from '../models/calendar-event.model';

/** The user's own IANA zone, Eg 'Europe/London'. */
export function userTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Today's date in `timeZone`, `'YYYY-MM-DD'`. */
export function todayIn(timeZone: string): string {
  return Temporal.Now.plainDateISO(timeZone).toString();
}

/** UTC instant at minute precision, `'YYYY-MM-DDTHH:mmZ'`. */
export function toMinuteInstant(instant: string): string {
  return Temporal.Instant.from(instant).toString({ smallestUnit: 'minute' });
}

/** Events that overlap the business date `date` as seen in `timeZone`, earliest first. */
export function eventsOnDay<T extends CalendarEvent>(
  events: readonly T[],
  date: string,
  timeZone: string,
): T[] {
  const dayStart = Temporal.PlainDate.from(date).toZonedDateTime({ timeZone }).toInstant();
  const dayEnd = Temporal.PlainDate.from(date)
    .add({ days: 1 })
    .toZonedDateTime({ timeZone })
    .toInstant();

  return events
    .filter((event) => {
      const start = Temporal.Instant.from(event.startDateTime);
      const end = Temporal.Instant.from(event.endDateTime);
      return (
        Temporal.Instant.compare(start, dayEnd) < 0 && Temporal.Instant.compare(end, dayStart) > 0
      );
    })
    .sort((a, b) =>
      Temporal.Instant.compare(
        Temporal.Instant.from(a.startDateTime),
        Temporal.Instant.from(b.startDateTime),
      ),
    );
}

/** `'09:00 – 10:30'` in `timeZone`, with the end's date added when it ends on a later day. */
export function formatTimeRange(
  startDateTime: string,
  endDateTime: string,
  timeZone: string,
  locale: string,
): string {
  const start = Temporal.Instant.from(startDateTime).toZonedDateTimeISO(timeZone);
  const end = Temporal.Instant.from(endDateTime).toZonedDateTimeISO(timeZone);
  const time: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const endText = start.toPlainDate().equals(end.toPlainDate())
    ? end.toLocaleString(locale, time)
    : end.toLocaleString(locale, { ...time, day: 'numeric', month: 'short' });
  return `${start.toLocaleString(locale, time)} – ${endText}`;
}

/** `'Thursday 1 October 2026'`-style long date for `instant` in `timeZone`. */
export function formatLongDate(instant: string, timeZone: string, locale: string): string {
  return Temporal.Instant.from(instant)
    .toZonedDateTimeISO(timeZone)
    .toLocaleString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Weekday and date parts of a business date, for the day panel's two-line heading. */
export function formatDayHeading(date: string, locale: string): { weekday: string; date: string } {
  const plain = Temporal.PlainDate.from(date);
  return {
    weekday: plain.toLocaleString(locale, { weekday: 'long' }),
    date: plain.toLocaleString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
