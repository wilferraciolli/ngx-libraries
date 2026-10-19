import { InjectionToken } from '@angular/core';
import { DEFAULT_DATE_TIME_LOCALE } from '../constants/date-time.constants';

/** A plain function the app supplies, read fresh on every call — see `NGX_FORMS_LOCALE`. */
export type FormsLocaleResolver = () => string;

/**
 * Which locale a date/time field's picker displays and parses in, when its own `FieldDef`
 * doesn't set `dateTimeConfig.locale` — an explicit per-field `locale` always wins over this.
 * Defaults to `DEFAULT_DATE_TIME_LOCALE` ('en-GB'), same as before this token existed, not the
 * browser's own language: unlike `ngx-dates`' `NGX_DATES_LOCALE` (read-only display text), this
 * locale also decides which *typed* day/month order `LocaleDateAdapter.parse()` accepts, so
 * switching it changes user input behaviour, not just wording — an app opts in deliberately:
 *
 * ```ts
 * { provide: NGX_FORMS_LOCALE, useFactory: () => { const translations = inject(TranslationsService); return () => translations.locale(); } }
 * ```
 *
 * A plain function rather than a direct import of `ngx-translations`' `TranslationsService`, so this package
 * stays buildable and publishable on its own — same reasoning as `ngx-dates`' `NGX_DATES_LOCALE`
 * (see root `CLAUDE.md`'s "Inter-package deps").
 */
export const NGX_FORMS_LOCALE = new InjectionToken<FormsLocaleResolver>('NGX_FORMS_LOCALE', {
  factory: () => () => DEFAULT_DATE_TIME_LOCALE,
});
