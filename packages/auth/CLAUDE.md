# @wiltech-labs/ngx-auth

Shared Angular authentication — a Clerk-backed `AuthStore`, an `authGuard`, and an
`authInterceptor` that scopes the bearer token to the app's own API origin. See root
`../../CLAUDE.md` for repo-wide conventions.

Decided 2026-09-30: this exact Clerk integration (state shape, the `mountSignIn()` gotcha, guard,
interceptor) was already built and exercised in more than one consuming app before this package
existed — genuinely copy-pasted each time, not a from-scratch design. This package generalizes that
shape into a reusable, configurable library rather than continuing to hand-roll it per app. See root
`NEXT_STEPS.md` for the fuller decision history.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/             # NgxAuthConfig, NGX_AUTH_CONFIG token
    ├── services/           # AuthStore — user/session/isSignedIn, init(), getToken(), signIn()/signOut()
    ├── providers/          # provideAuth() — wraps provideAppInitializer()
    ├── guards/             # authGuard (CanActivateFn)
    └── interceptors/       # authInterceptor (HttpInterceptorFn)
```

## Conventions

- Real Angular constructs (`@Injectable`) — not framework-agnostic functions. Every known consumer
  is Angular, so idiomatic DI beats a generic-TS compromise.
- `@clerk/clerk-js` is a regular `dependency` of this package (not a peer) — same reasoning as
  `forms`' `temporal-polyfill` and `translations`' `@jsverse/transloco`: this package controls the
  exact version it's built against. Listed in `ng-package.json`'s `allowedNonPeerDependencies`.
- **Plain Angular signals (`signal()`/`computed()`), not `@ngrx/signals`' `signalStore()`.** The
  Clerk integrations this was generalized from used `signalStore()`, but no other package here
  depends on `@ngrx/signals`, and `AuthStore`'s state (`user`/`session`) is simple enough that a
  plain `@Injectable` with a private `signal()` and public `computed()`s — the same shape
  `ngx-translations`' `TranslationsService` already uses — does the job without adding a new
  third-party dependency this package doesn't otherwise need.
- **Never call `clerk.mountSignIn()`/`mountUserButton()`/any other `mount*` method.** The npm build
  of `@clerk/clerk-js` ships _without_ the embedded UI components bundle (only available through
  Clerk's React SDK) — a `mount*` call throws `Error: Clerk was not loaded with Ui components` at
  runtime, not at build time, so it slips past a typecheck and a first glance. `AuthStore.signIn()`
  uses `clerk.redirectToSignIn()` instead — a full-page redirect to Clerk's hosted Account Portal,
  the one sign-in entry point that doesn't depend on the missing bundle, and it behaves identically
  in a real browser and in Playwright.
- **`init()` must run from `provideAuth()`'s `provideAppInitializer`, never a component
  constructor** — so `authGuard`/`authInterceptor` never race a not-yet-loaded Clerk instance. This
  package enforces that by doing it itself inside `provideAuth()`; an app never calls
  `AuthStore.init()` directly.
- **`init()` sets `window.Clerk` to the loaded instance** — Clerk's own documented pattern for
  non-React ("headless") integrations, read by tooling that expects it there (e.g. `@clerk/testing`'s
  Playwright helpers). Every prior integration this was generalized from did this identically; kept
  as default behaviour, not made optional.
- **`NgxAuthConfig.apiOrigin` is required, not defaulted** — deliberately different from
  `ngx-api-client`'s own `API_ORIGIN` token, whose `''` default is safe there because it's used to
  build a URL, not to decide what gets a bearer token attached. An empty/omitted origin here would
  match every request (`'anything'.startsWith('')` is always `true`), leaking the Clerk session
  token to third-party calls (an image host, an unrelated API, a CDN, ...). Forcing the app to state
  its own origin explicitly closes that footgun rather than defaulting to something that happens to
  be safe only for a single-backend app.
- **`authInterceptor` doesn't gate access, and doesn't block a signed-out request.** It only decides
  whether to _attach_ a token; a request with no token still goes through unauthenticated. Access
  control is `authGuard`'s job, applied per-route — this split means an app with guest-accessible
  routes/API calls isn't forced through sign-in just by wiring this interceptor in.
- **`authInterceptor` isn't registered by `provideAuth()`.** Angular only wants one
  `provideHttpClient()` call per app; the interceptor is exported separately so the app adds it to
  its own `provideHttpClient(withInterceptors([authInterceptor, ...]))` call, alongside whatever
  other interceptors it has.
- `getToken()`'s `NgxAuthConfig.jwtTemplate` selects a named JWT template's token (Clerk Dashboard ->
  Configure -> JWT Templates) instead of the default session token — needed only when the API
  verifies a custom `aud` claim or reads custom claims (name/email) a template carries. Optional;
  omit it to use Clerk's default session token.

## Status

- New package: `provideAuth()`, `AuthStore`, `authGuard`, `authInterceptor`.
- Not yet published to npm — under development.
- No consumers yet within this monorepo. Every consuming app that already had its own hand-rolled
  version of this is a migration candidate once this is published — not done as part of building it.
