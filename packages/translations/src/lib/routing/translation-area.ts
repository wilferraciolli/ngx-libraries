import { inject } from '@angular/core';
import type { TranslationArea } from '../config/translations-config.token';
import { TranslationsService } from '../services/translations.service';

/**
 * A route resolver that loads one area's strings before its page renders:
 * `{ path: '', resolve: { strings: translationArea(TIME_STRINGS) }, children: [...] }`. A
 * componentless parent like that one covers every page of the area at once. Typed as a plain
 * function rather than the router's `ResolveFn`, so this package needs no `@angular/router`; it
 * fits a route's `resolve` all the same.
 */
export function translationArea(area: TranslationArea): () => Promise<void> {
  return () => inject(TranslationsService).loadArea(area);
}
