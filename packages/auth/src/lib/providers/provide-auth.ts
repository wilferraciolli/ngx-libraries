import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { NGX_AUTH_CONFIG, type NgxAuthConfig } from '../config/auth-config.token';
import { AuthStore } from '../services/auth.store';

/**
 * Sets up Clerk-backed auth for the app: register once in `app.config.ts`. Starts loading Clerk
 * via `provideAppInitializer` — never from a component constructor. By default the app waits for it
 * before rendering; with `waitAtStartup: false` it renders at once and `authGuard`/`authInterceptor`
 * wait instead, so neither races a not-yet-loaded Clerk instance either way. A Clerk that can't load
 * doesn't stop the app rendering (signed out); `loadTimeoutMs` caps how long anything waits for it.
 *
 * `authInterceptor` is *not* registered here — add it to the app's own
 * `provideHttpClient(withInterceptors([authInterceptor, ...]))` call alongside any other
 * interceptors, since Angular only wants one `provideHttpClient()` call per app.
 */
export function provideAuth(config: NgxAuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGX_AUTH_CONFIG, useValue: config },
    provideAppInitializer(() => {
      const ready = inject(AuthStore).whenReady();
      return config.waitAtStartup === false ? undefined : ready;
    }),
  ]);
}
