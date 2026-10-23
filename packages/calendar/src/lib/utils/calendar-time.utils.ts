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

/** The day after a business date: FullCalendar's all-day `end` is exclusive. */
export function dayAfter(date: string): string {
  return Temporal.PlainDate.from(date).add({ days: 1 }).toString();
}

/**
 * Events on the business date `date` as seen in `timeZone`: all-day events first (in the order
 * given), then timed ones that overlap the day, earliest first. An all-day event is on every day
 * from its first to its last, whatever the zone.
 */
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

  const allDay = events.filter(
    (event) => event.allDay && event.startDateTime <= date && date <= event.endDateTime,
  );
  const timed = events
    .filter((event) => {
      if (event.allDay) return false;
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
  return [...allDay, ...timed];
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

/** `'Monday 2 November 2026'`, or `'… – Friday 6 November 2026'` for an all-day span. */
export function formatDateSpan(startDate: string, endDate: string, locale: string): string {
  const long: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const start = Temporal.PlainDate.from(startDate).toLocaleString(locale, long);
  if (startDate === endDate) return start;
  return `${start} – ${Temporal.PlainDate.from(endDate).toLocaleString(locale, long)}`;
}

/** Weekday and date parts of a business date, for the day panel's two-line heading. */
export function formatDayHeading(date: string, locale: string): { weekday: string; date: string } {
  const plain = Temporal.PlainDate.from(date);
  return {
    weekday: plain.toLocaleString(locale, { weekday: 'long' }),
    date: plain.toLocaleString(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
