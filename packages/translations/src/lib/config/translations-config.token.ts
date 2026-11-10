import { InjectionToken, Type } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';

/**
 * Reads the app's own current locale preference (e.g. a signed-in user's saved language). Called
 * inside a `computed()`, so it can read the app's own signals and will re-run when they change —
 * an async source (a profile loading after sign-in) takes effect once it resolves, the same as an
 * explicit `TranslationsService.setLocale()` call. Return `undefined` to fall through to `defaultLocale`.
 * This session's own `setLocale()` choice always wins over it. Runs in the root injection context,
 * so it may `inject()` the app's own stores directly.
 */
export type LocaleResolver = () => string | undefined;

/**
 * A dictionary loaded the first time its locale is used, e.g.
 * `() => import('./el-GR').then((m) => m.EL_GR)`: the bundler splits it out, so a locale few users
 * pick doesn't weigh on everyone's first download.
 */
export type LazyTranslation = () => Promise<Translation>;

/**
 * One area of an app's strings (its time pages, its leave pages, ...), per locale, each split out of
 * the first download, e.g. `{ 'en-GB': () => import('./time/en-GB').then((m) => m.TIME_EN_GB) }`.
 * The area's routes load it with `translationArea()`, the first time someone opens one of them, in
 * the locale they're using; a later language switch loads that locale's too. Its keys are merged
 * into the locale's dictionary as they are, so keep each area's top-level keys its own. Give every
 * locale the app supports: a locale left out shows its fallback locale's text only when that one is
 * loaded too.
 */
export type TranslationArea = Readonly<Record<string, LazyTranslation>>;

export interface NgxTranslationsConfig {
  /** Every locale the app supports, e.g. `['en-GB', 'el-GR']`. Becomes Transloco's `availableLangs`. */
  locales: string[];
  /** Used before `resolveLocale` settles, and whenever nothing else resolves a locale. */
  defaultLocale: string;
  /**
   * Bundled at build time — one dictionary per locale, each merging every translation namespace
   * ahead of time (e.g. `{ 'en-GB': { common: {...}, forms: {...} }, 'el-GR': {...} }`). The right
   * default for a small, finite set of locales: no network round trip, no loading state. A locale
   * can be a {@link LazyTranslation} instead, split out of the first download and loaded when first
   * used (keys show their fallback locale's text until it arrives). Omit when providing `loader`.
   */
  dictionaries?: Record<string, Translation | LazyTranslation>;
  /** For many locales, or translations served by the backend, in place of `dictionaries`. */
  loader?: Type<TranslocoLoader>;
  /** See {@link LocaleResolver}. */
  resolveLocale?: LocaleResolver;
  /**
   * Fire-and-forget — called after `setLocale()` so the app can persist the choice however it
   * likes (a PATCH to the user's own profile, browser storage, both). Never awaited, never blocks
   * or reverts the session's chosen language: the switch already happened before this runs.
   * Runs in the root injection context, so it may `inject()` the app's own stores directly.
   */
  persistLocale?: (locale: string) => void;
}

export const NGX_TRANSLATIONS_CONFIG = new InjectionToken<NgxTranslationsConfig>(
  'NGX_TRANSLATIONS_CONFIG',
);
