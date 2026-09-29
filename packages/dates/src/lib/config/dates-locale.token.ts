import { InjectionToken } from '@angular/core';

/** A plain function the app supplies, read fresh on every call — see `NGX_DATES_LOCALE`. */
export type DatesLocaleResolver = () => string;

/**
 * Which locale `RelativeTimeService`/`RelativeTimePipe` format against. Defaults to the browser's
 * own language and never changes on its own — an app using `@wiltech-labs/ngx-i18n` overrides it
 * to read that package's `I18nService.locale()`, so a language switch there is picked up here too:
 *
 * ```ts
 * { provide: NGX_DATES_LOCALE, useFactory: () => { const i18n = inject(I18nService); return () => i18n.locale(); } }
 * ```
 *
 * A plain function rather than a direct import of `I18nService`, so this package stays buildable
 * and publishable on its own — it has no dependency on `ngx-i18n`, or on any particular i18n setup
 * at all. Read `RelativeTimePipe`'s `effect()` for why a resolver that internally reads a signal
 * still notifies the pipe reactively despite being "just a function" here.
 */
export const NGX_DATES_LOCALE = new InjectionToken<DatesLocaleResolver>('NGX_DATES_LOCALE', {
  factory: () => () => (typeof navigator !== 'undefined' ? navigator.language : 'en-GB')
});
