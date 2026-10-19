# @wiltech-labs/ngx-auth

Shared Angular authentication, backed by [Clerk](https://clerk.com/): an `AuthStore` for
"who's signed in", an `authGuard` for signed-in-only routes, and an `authInterceptor` that attaches
the session token to your own API calls — never to a third-party request.

## Installation

```bash
npm install @wiltech-labs/ngx-auth
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/router` (all `^22`). `@clerk/clerk-js`
is installed automatically as a regular dependency of this package.

## Setup

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAuth, authInterceptor } from '@wiltech-labs/ngx-auth';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth({
      clerkPublishableKey: environment.clerkPublishableKey,
      apiOrigin: environment.apiUrl,
    }),
  ],
};
```

`provideAuth()` loads Clerk and starts tracking the session before the app renders (via
`provideAppInitializer`) — nothing else to wire up for that part. `authInterceptor` is registered
separately, in your own `provideHttpClient(withInterceptors([...]))` call, since Angular only wants
one `provideHttpClient()` call per app.

### Config

```ts
interface NgxAuthConfig {
  clerkPublishableKey: string; // Clerk Dashboard -> API Keys
  apiOrigin: string; // required — see "Why apiOrigin is required" below
  jwtTemplate?: string; // Clerk Dashboard -> Configure -> JWT Templates
  redirectTo?: string; // where authGuard sends a signed-out visitor; defaults to '/'
}
```

#### Why `apiOrigin` is required

`authInterceptor` only attaches `Authorization: Bearer <token>` to a request whose URL starts with
`apiOrigin`. There's no default — an empty/omitted value would match _every_ request
(`'anything'.startsWith('')` is always `true`), which would leak your Clerk session token to any
third-party call an app makes (an image host, an unrelated API, a CDN, ...). Stating your own API's
origin explicitly is the whole point of the check.

#### `jwtTemplate`

Only needed if your API verifies a custom `aud` claim, or reads custom claims (name, email, ...)
that only a named JWT template carries. Set it to that template's name in the Clerk Dashboard; leave
it unset to use Clerk's default session token.

## Usage

### Sign in / sign out

```ts
import { Component, inject } from '@angular/core';
import { AuthStore } from '@wiltech-labs/ngx-auth';

@Component({ selector: 'app-nav-bar' /* ... */ })
export class NavBar {
  protected readonly auth = inject(AuthStore);

  protected signIn(): void {
    void this.auth.signIn(); // full-page redirect to Clerk's hosted Account Portal
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}
```

```html
@if (auth.isSignedIn()) {
<span>{{ auth.user()?.firstName }}</span>
<button type="button" (click)="signOut()">Sign out</button>
} @else {
<button type="button" (click)="signIn()">Sign in</button>
}
```

`AuthStore.user`/`AuthStore.session` are `Signal`s holding Clerk's own `user`/`session` objects
directly — not a hand-rolled DTO. Read fields off them directly:
`auth.user()?.primaryEmailAddress?.emailAddress`.

**Never call `clerk.mountSignIn()`/`mountUserButton()`/any other `mount*` method** — the npm build
of `@clerk/clerk-js` ships without the embedded UI components bundle (only available through
Clerk's React SDK). `AuthStore.signIn()` already avoids this; don't reach for Clerk's own component
mounting APIs directly.

### Guarding a route

```ts
import { authGuard } from '@wiltech-labs/ngx-auth';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // keep at least one route public
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
];
```

Apply `authGuard` only to routes that actually require sign-in — it's per-route, not a global gate,
so a guest-accessible route simply doesn't list it.

### Calling your API

Nothing to do beyond the `authInterceptor` setup above — every `HttpClient` call whose URL starts
with your configured `apiOrigin` gets the `Authorization` header automatically. A signed-out
visitor's request to that same origin still goes through, just without the header; the interceptor
doesn't block anything, it only decides whether to attach a token.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/             # NgxAuthConfig, NGX_AUTH_CONFIG token
    ├── services/           # AuthStore
    ├── providers/          # provideAuth()
    ├── guards/             # authGuard
    └── interceptors/       # authInterceptor
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/auth
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
