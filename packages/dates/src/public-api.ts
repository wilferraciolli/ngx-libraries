// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Config
export { NGX_DATES_LOCALE } from './lib/config/dates-locale.token';
export type { DatesLocaleResolver } from './lib/config/dates-locale.token';

// Service
export { RelativeTimeService } from './lib/services/relative-time.service';

// Pipe
export { RelativeTimePipe } from './lib/pipes/relative-time.pipe';

// Wire-format type for a value this package accepts
export type { InstantLike } from './lib/utils/relative-time.utils';
