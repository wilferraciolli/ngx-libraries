import { InjectionToken } from '@angular/core';

/** A plain function the app supplies, read fresh on every call — see `NGX_DATES_LOCALE`. */
export type DatesLocaleResolver = () => string;

/**
 * Which locale `RelativeTimeService`/`RelativeTimePipe` format against. Defaults to the browser's
 * own language and never changes on its own — an app using `@wiltech-labs/ngx-translations` overrides it
 * to read that package's `TranslationsService.locale()`, so a language switch there is picked up here too:
 *
 * ```ts
 * { provide: NGX_DATES_LOCALE, useFactory: () => { const translations = inject(TranslationsService); return () => translations.locale(); } }
 * ```
 *
 * A plain function rather than a direct import of `TranslationsService`, so this package stays buildable
 * and publishable on its own — it has no dependency on `ngx-translations`, or on any particular i18n setup
 * at all. Read `RelativeTimePipe`'s `effect()` for why a resolver that internally reads a signal
 * still notifies the pipe reactively despite being "just a function" here.
 */
export const NGX_DATES_LOCALE = new InjectionToken<DatesLocaleResolver>('NGX_DATES_LOCALE', {
  factory: () => () => (typeof navigator !== 'undefined' ? navigator.language : 'en-GB'),
});
