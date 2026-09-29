import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import { NGX_I18N_CONFIG } from '../config/i18n-config.token';

/**
 * The default loader: reads `NgxI18nConfig.dictionaries`, already bundled at build time, so there's
 * nothing to fetch. `provideI18n({ loader })` swaps this out for a real one when there are too many
 * locales to bundle, or translations are served by the backend.
 */
@Injectable()
export class BundledI18nLoader implements TranslocoLoader {
  private readonly config = inject(NGX_I18N_CONFIG);

  public getTranslation(lang: string): Observable<Translation> {
    return of(this.config.dictionaries?.[lang] ?? {});
  }
}
