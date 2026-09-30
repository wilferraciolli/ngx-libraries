import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NGX_AUTH_CONFIG } from '../config/auth-config.token';
import { AuthStore } from '../services/auth.store';

/**
 * Gates a signed-in-only route, bouncing a signed-out visitor to `NgxAuthConfig.redirectTo`
 * (default `'/'`) instead. Apply this only to routes that actually require sign-in — an app with
 * guest-accessible routes simply doesn't add this guard to them; it isn't a global gate.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const { redirectTo = '/' } = inject(NGX_AUTH_CONFIG);
  return auth.isSignedIn() ? true : router.createUrlTree([redirectTo]);
};
