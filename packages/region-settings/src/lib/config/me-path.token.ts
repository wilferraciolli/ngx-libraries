import { InjectionToken } from '@angular/core';

/**
 * The path `CurrentUserStore` appends to `API_ORIGIN` for its `/me` bootstrap request — the one URL
 * this package builds itself. Defaults to `/api/me`; an API that serves `/me` elsewhere (Eg under an
 * area prefix, `/api/platform/me`, so a reverse proxy can route by URL) provides its own:
 * `{ provide: NGX_ME_PATH, useValue: '/api/platform/me' }`.
 */
export const NGX_ME_PATH = new InjectionToken<string>('NGX_ME_PATH', {
  providedIn: 'root',
  factory: () => '/api/me',
});
