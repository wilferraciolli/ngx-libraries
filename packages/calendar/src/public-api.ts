// Barrel — re-export the entire public surface

export { Calendar } from './lib/components/calendar/calendar';

export type {
  CalendarEvent,
  CalendarEventColor,
  CalendarEventConfig,
  CalendarView,
} from './lib/models/calendar-event.model';

export { CalendarEventMapper } from './lib/services/calendar-event-mapper.service';
export type { CalendarEventMapping } from './lib/services/calendar-event-mapper.service';

export { NGX_CALENDAR_LOCALE } from './lib/config/calendar-locale.token';
export type { CalendarLocaleResolver } from './lib/config/calendar-locale.token';
export { DEFAULT_CALENDAR_TEXT, NGX_CALENDAR_TEXT } from './lib/config/calendar-text.token';
export type { CalendarText } from './lib/config/calendar-text.token';
