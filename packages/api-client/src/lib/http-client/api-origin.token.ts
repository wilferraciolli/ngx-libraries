import { InjectionToken } from '@angular/core';

/**
 * The bare origin a link's `href` resolves against (e.g. `https://api.example.com`)
 * — `href`s already include the API prefix (e.g. `/api`), so this must NOT
 * include it. Defaults to `''` (same-origin — `href` is used as-is), so
 * only apps where the frontend and backend are on different origins need
 * to provide it:
 *
 * ```ts
 * providers: [{ provide: API_ORIGIN, useValue: environment.apiOrigin }]
 * ```
 */
export const API_ORIGIN = new InjectionToken<string>('WILTECH_API_ORIGIN', {
  providedIn: 'root',
  factory: () => '',
});
