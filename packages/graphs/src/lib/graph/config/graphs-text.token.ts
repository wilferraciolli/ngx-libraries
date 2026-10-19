import { InjectionToken } from '@angular/core';

/** This package's own overridable UI strings (the "Show data" toggle text). */
export interface GraphsText {
  showData: string;
}

export const DEFAULT_GRAPHS_TEXT: GraphsText = {
  showData: 'Show data',
};

/** A plain function the app supplies, read fresh on every read — see `NGX_GRAPHS_TEXT`. */
export type GraphsTextResolver = () => GraphsText;

/**
 * `GraphFrame`'s own UI text (the "Show data" table toggle) — everything else this package renders
 * is app-supplied data (`GraphDef`/`PointGraphDef`), never a hardcoded string. Defaults to English;
 * override to translate it, e.g. wired to `ngx-translations`:
 *
 * ```ts
 * { provide: NGX_GRAPHS_TEXT, useFactory: () => { const translations = inject(TranslationsService); return () => ({ showData: translations.t('graphs.showData') }); } }
 * ```
 *
 * A plain function rather than a direct import of `ngx-translations`' `TranslationsService`, so this package
 * stays buildable and publishable on its own — same reasoning as `ngx-dates`' `NGX_DATES_LOCALE`
 * (see root `CLAUDE.md`'s "Inter-package deps"). Read inside a `computed()` in `GraphFrame`, so a
 * resolver that internally reads a signal (as the recipe above does) stays reactive to a language
 * switch despite being "just a function" from this package's point of view.
 */
export const NGX_GRAPHS_TEXT = new InjectionToken<GraphsTextResolver>('NGX_GRAPHS_TEXT', {
  factory: () => () => DEFAULT_GRAPHS_TEXT,
});
