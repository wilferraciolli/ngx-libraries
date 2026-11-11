import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { NGX_AUTH_CONFIG } from '../config/auth-config.token';
import { AuthStore } from '../services/auth.store';

/**
 * Gates a signed-in-only route, bouncing a signed-out visitor to `NgxAuthConfig.redirectTo`
 * (default `'/'`) instead. Apply this only to routes that actually require sign-in — an app with
 * guest-accessible routes simply doesn't add this guard to them; it isn't a global gate.
 *
 * Waits for `AuthStore.whenReady()` first, so a signed-in visitor isn't bounced while Clerk is
 * still loading (with `waitAtStartup: false`, or past `loadTimeoutMs`).
 */
export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const { redirectTo = '/' } = inject(NGX_AUTH_CONFIG);
  await auth.whenReady();
  return auth.isSignedIn() ? true : router.createUrlTree([redirectTo]);
};
