import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { NGX_TRANSLATIONS_CONFIG } from '../config/translations-config.token';

/**
 * The default loader: reads `NgxTranslationsConfig.dictionaries`, already bundled at build time, so there's
 * nothing to fetch, except a locale given as a `LazyTranslation`, imported the first time it's used.
 * `provideTranslations({ loader })` swaps this out for a real one when there are too many locales to
 * bundle, or translations are served by the backend.
 */
@Injectable()
export class BundledTranslationsLoader implements TranslocoLoader {
  private readonly config = inject(NGX_TRANSLATIONS_CONFIG);

  public getTranslation(lang: string): Observable<Translation> {
    const dictionary = this.config.dictionaries?.[lang];
    return typeof dictionary === 'function' ? from(dictionary()) : of(dictionary ?? {});
  }
}
