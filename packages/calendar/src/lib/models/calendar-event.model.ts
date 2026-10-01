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
 * `source` carries the app's own object through untouched, so a saved event can be matched back to
 * it. `CalendarEventMapper` fills it in.
 */
export interface CalendarEvent<TSource = unknown> {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  config?: CalendarEventConfig;
  source?: TSource;
}

export type CalendarView = 'day' | 'week' | 'month';
