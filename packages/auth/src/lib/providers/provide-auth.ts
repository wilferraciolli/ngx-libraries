import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { NGX_AUTH_CONFIG, type NgxAuthConfig } from '../config/auth-config.token';
import { AuthStore } from '../services/auth.store';

/**
 * Sets up Clerk-backed auth for the app: register once in `app.config.ts`. Runs `AuthStore.init()`
 * via `provideAppInitializer` — before the app renders, never from a component constructor — so
 * `authGuard`/`authInterceptor` never race a not-yet-loaded Clerk instance.
 *
 * `authInterceptor` is *not* registered here — add it to the app's own
 * `provideHttpClient(withInterceptors([authInterceptor, ...]))` call alongside any other
 * interceptors, since Angular only wants one `provideHttpClient()` call per app.
 */
export function provideAuth(config: NgxAuthConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGX_AUTH_CONFIG, useValue: config },
    provideAppInitializer(() => inject(AuthStore).init()),
  ]);
}
