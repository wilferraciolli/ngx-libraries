import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { NGX_AUTH_CONFIG } from '../config/auth-config.token';
import { AuthStore } from '../services/auth.store';

/**
 * Attaches `Authorization: Bearer <token>` to a request only when its URL starts with
 * `NgxAuthConfig.apiOrigin` — never leaks the Clerk session token to a third-party request (an
 * image host, an unrelated API, ...). A signed-out visitor's request still goes through, with no
 * header added — this interceptor doesn't gate access (`authGuard` does that at the route level),
 * so an app with guest-accessible API calls isn't forced through sign-in just by adding it.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiOrigin } = inject(NGX_AUTH_CONFIG);
  if (!req.url.startsWith(apiOrigin)) {
    return next(req);
  }

  const auth = inject(AuthStore);
  return from(auth.getToken()).pipe(
    switchMap((token) => next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req))
  );
};
