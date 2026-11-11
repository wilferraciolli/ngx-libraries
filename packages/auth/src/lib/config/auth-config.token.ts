import { InjectionToken } from '@angular/core';

export interface NgxAuthConfig {
  /** Clerk's publishable key (Clerk Dashboard -> API Keys). */
  clerkPublishableKey: string;
  /**
   * `authInterceptor` only attaches the token to a request whose URL starts with this origin —
   * required, not defaulted, on purpose: an empty/omitted value would match every request
   * (`''.startsWith('')` is always true), leaking the Clerk session token to third-party calls
   * (an image host, an unrelated API, ...). Same shape as `ngx-api-client`'s own `API_ORIGIN`,
   * but that token's `''` default is safe there only because it's used to build a URL, not to
   * decide what gets a bearer token attached.
   */
  apiOrigin: string;
  /**
   * A named JWT template's token (Clerk Dashboard -> Configure -> JWT Templates) instead of the
   * default session token — needed when the API verifies a custom `aud` claim, or reads custom
   * claims (name/email) that only a named template carries. Omit to use Clerk's default session
   * token.
   */
  jwtTemplate?: string;
  /** Where `authGuard` sends a signed-out visitor. Defaults to `'/'`. */
  redirectTo?: string;
  /**
   * How long start-up waits for Clerk, in milliseconds, before the app renders signed out — for a
   * page that must open without the sign-in service (offline, or during a Clerk outage), such as a
   * shared kiosk. Clerk keeps loading, and `user`/`session`/`isLoaded` follow once it has. Omit to
   * wait for as long as it takes, as before.
   */
  loadTimeoutMs?: number;
  /**
   * Whether the app waits for Clerk before it first renders. Defaults to `true`, as before. Set
   * `false` and the app renders at once while Clerk loads: `authGuard` and `authInterceptor` wait
   * for it themselves, so a guarded route opens, and an API call carries its token, only once Clerk
   * has loaded or given up. An unguarded page should show a loading state while `isSettled` is
   * false, or a signed-in visitor sees the signed-out version of it first.
   */
  waitAtStartup?: boolean;
  /**
   * Which build of the Clerk SDK to load. `'standard'` (the default) is `@clerk/clerk-js`.
   * `'no-rhc'` is `@clerk/clerk-js/no-rhc`, built without remotely hosted code: about 40% smaller
   * (334 kB against 573 kB compressed, 6.39). It leaves out the code Clerk would load from its own
   * servers, among it the Turnstile bot check and Stripe, which only matter to an app that runs
   * Clerk's sign-up or billing in its own pages. An app that signs in through `signIn()` (Clerk's
   * hosted pages, where Clerk runs its own checks) loses nothing.
   */
  sdkBuild?: 'standard' | 'no-rhc';
}

export const NGX_AUTH_CONFIG = new InjectionToken<NgxAuthConfig>('NGX_AUTH_CONFIG');
