import type { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { TranslationsService } from '../services/translations.service';

/**
 * Sends the current locale as `Accept-Language` (`el-CY`), so an API that writes its own words —
 * error messages, notifications, exported files — answers in the language the person reads the app
 * in. A request that already says which language it wants is left as it is. `Accept-Language` is a
 * CORS-safelisted header for a plain locale, so it adds no preflight to a cross-origin call.
 */
export const languageInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (request.headers.has('Accept-Language')) {
    return next(request);
  }
  const locale: string = inject(TranslationsService).locale();
  return next(request.clone({ setHeaders: { 'Accept-Language': locale } }));
};
