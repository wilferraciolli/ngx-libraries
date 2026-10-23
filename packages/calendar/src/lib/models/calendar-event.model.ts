/** Material 3 colour role an event is drawn in: the role's `-container` / `on-…-container` pair. */
export type CalendarEventColor = 'primary' | 'secondary' | 'tertiary' | 'error' | 'neutral';

/** How one event looks. Every property is optional; an event with no config is drawn in `primary`. */
export interface CalendarEventConfig {
  /** Colour role. Default `'primary'`. */
  color?: CalendarEventColor;
  /** Overrides the role's container colour. Prefer a token: `'var(--mat-sys-tertiary)'`. */
  backgroundColor?: string;
  /** Overrides the role's on-container colour. Prefer a token. */
  textColor?: string;
  /** Extra class names on the event element, for anything the colours don't cover. */
  className?: string;
  /** `false` hides the Edit action for this event even when the calendar is editable. */
  editable?: boolean;
}

/**
 * One event on the calendar. Start and end are UTC instants, `'YYYY-MM-DDTHH:mmZ'` (seconds are
 * accepted too). The calendar shows them in its `timeZone`.
 *
 * An `allDay` event (leave, a public holiday, a deadline) is whole days instead: start and end are
 * business dates, `'YYYY-MM-DD'`, both included, shown on those days whatever the `timeZone`. It sits
 * in the all-day row of the day and week views and opens read-only.
 *
 * `source` carries the app's own object through untouched, so a saved event can be matched back to
 * it. `CalendarEventMapper` fills it in.
 */
export interface CalendarEvent<TSource = unknown> {
  id: string;
  title: string;
  description: string;
  /** UTC instant; for an `allDay` event, its first day, `'YYYY-MM-DD'`. */
  startDateTime: string;
  /** UTC instant; for an `allDay` event, its last day, `'YYYY-MM-DD'` (included). */
  endDateTime: string;
  allDay?: boolean;
  config?: CalendarEventConfig;
  source?: TSource;
}

export type CalendarView = 'day' | 'week' | 'month';

/**
 * A public holiday (or a closure day): drawn as a shaded day with a labelled chip, "Public
 * holiday · Green Monday", and listed first in the day panel. Not an event: it can't be opened or
 * edited. The shape `wiltech-labs-holidays` (Python) sends; extra fields are ignored.
 */
export interface CalendarHoliday {
  /** Business date, `'YYYY-MM-DD'`. */
  date: string;
  name: string;
  /** `'public'` (the default) is labelled "Public holiday"; any other category "Holiday". */
  category?: string;
}

/** The business dates on screen, both included, in the calendar's zone. A month view includes the
 *  days of the neighbouring months that fill its first and last rows. */
export interface CalendarRange {
  start: string;
  end: string;
}
