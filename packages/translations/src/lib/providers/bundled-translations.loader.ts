import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { NGX_TRANSLATIONS_CONFIG } from '../config/translations-config.token';

/**
 * The default loader: reads `NgxTranslationsConfig.dictionaries`, already bundled at build time, so there's
 * nothing to fetch. `provideTranslations({ loader })` swaps this out for a real one when there are too many
 * locales to bundle, or translations are served by the backend.
 */
@Injectable()
export class BundledTranslationsLoader implements TranslocoLoader {
  private readonly config = inject(NGX_TRANSLATIONS_CONFIG);

  public getTranslation(lang: string): Observable<Translation> {
    return of(this.config.dictionaries?.[lang] ?? {});
  }
}
