# @wiltech-labs/ngx-region-settings

Ready-to-use Angular signal stores for the "who am I, what can I configure" flow almost every app
repeats: sign in → `/me` → follow its `userProfile` link → follow `userSettings`/`systemSettings`
links off the profile. Every link is followed as the API hands it out — nothing here builds a URL by
hand except the one `/me` bootstrap request.

## Installation

```bash
npm install @wiltech-labs/ngx-region-settings
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/material`, `rxjs`.
This package also depends directly on `@wiltech-labs/ngx-api-client`, `@wiltech-labs/ngx-auth`, and
`@wiltech-labs/ngx-forms` — install all three alongside it and wire `provideAuth()`/`API_ORIGIN` as
their own READMEs describe.

## Usage

### Current user

```ts
import { Component, inject } from '@angular/core';
import { CurrentUserStore } from '@wiltech-labs/ngx-region-settings';

@Component({ selector: 'app-nav-bar' /* ... */ })
export class NavBar {
  protected readonly currentUser = inject(CurrentUserStore);
}
```

```html
@if (currentUser.loading()) {
<span>Loading…</span>
} @else if (currentUser.me(); as me) {
<span>{{ me.name }}</span>
}
```

`CurrentUserStore` is root-provided — inject it anywhere. It only fetches once
`AuthStore.isSignedIn()` is `true`, and clears itself again on sign-out. `CurrentUserStore.link(name)`
reads any named link off the loaded profile (`userSettings`, `systemSettings`, or an app's own, e.g.
a `notifications` link) — never build one of these URLs yourself.

### Settings screens

```ts
import { Component, inject } from '@angular/core';
import { UserSettingsStore } from '@wiltech-labs/ngx-region-settings';

@Component({
  selector: 'app-my-settings-page',
  providers: [UserSettingsStore], // feature-local — each page gets its own instance
})
export class MySettingsPage {
  protected readonly store = inject(UserSettingsStore);

  protected async save(): Promise<void> {
    await this.store.save({
      timezone: 'Europe/London',
      language: 'en-GB',
      locale: 'en-GB',
      currency: 'GBP',
      theme: 'light',
    });
  }
}
```

```html
@if (store.notAvailable()) {
<p>You don't have access to this screen.</p>
} @else if (store.settings(); as settings) {
<!-- store.options() gives you {value, viewValue}[] per field, straight from the API's own
       metadata — never a hardcoded <select> list -->
<p>Timezone: {{ settings.timezone }}</p>
}
```

`SystemSettingsStore` is the admin-only equivalent — same API, reading/writing through the profile's
`systemSettings` link instead of `userSettings`. Use it exactly the same way.

### Ready-made settings form

`RegionSettingsFormComponent` renders the five region fields (timezone, language, locale, currency,
theme) as `@wiltech-labs/ngx-forms` `SelectField`s, wired to whichever store's `settings()`/`options()`
you pass in — no need to build this form yourself:

```html
<ngx-region-settings-form
  [settings]="store.settings()"
  [options]="store.options()"
  [saving]="store.saving()"
  (save)="store.save($event)"
/>
```

Override the Save/Saving button text by providing `NGX_REGION_SETTINGS_FORM_TEXT` (a
`() => RegionSettingsFormText` resolver — same pattern as `ngx-notifications`' text token); it stays
English by default.

### A different payload shape

Both stores are generic. If your API's `/me`, `userProfile`, or settings payload genuinely differs
from the defaults (`Me`/`UserProfile`/`RegionSettings`/`RegionSettingsPayload`, all exported from
this package), subclass instead:

```ts
import { Injectable } from '@angular/core';
import { RegionSettingsStore } from '@wiltech-labs/ngx-region-settings';
import type { ILink } from '@wiltech-labs/ngx-api-client';

interface MyOrgSettings {
  id: string;
  links: Record<string, ILink>;
  reportingCurrency: string;
}

@Injectable()
export class OrgSettingsStore extends RegionSettingsStore<
  MyOrgSettings,
  { reportingCurrency: string }
> {
  protected readonly root = 'orgSettings';
  protected profileLink(): ILink | undefined {
    return this.currentUser.link('orgSettings');
  }
}
```

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # Identifiable, Me/UserProfile, RegionSettings/RegionSettingsPayload
    ├── stores/             # CurrentUserStore, RegionSettingsStore + UserSettingsStore/SystemSettingsStore
    ├── config/             # NGX_REGION_SETTINGS_FORM_TEXT
    └── components/         # RegionSettingsFormComponent
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/region-settings
npm run build
```

Then, **before** `npm publish`: `ng-packagr` copies `dependencies` verbatim into
`dist/package.json`, including this package's own `file:../api-client/dist` /
`file:../auth/dist` / `file:../forms/dist` entries (see this package's `CLAUDE.md` for why they're
`file:` references at all) — those are meaningless outside this monorepo, so hand-edit
`dist/package.json` to point them at the real published version ranges first, e.g.:

```json
"dependencies": {
  "@wiltech-labs/ngx-api-client": "^1.0.0",
  "@wiltech-labs/ngx-auth": "^1.0.0",
  "@wiltech-labs/ngx-forms": "^1.0.0"
}
```

Then publish the fixed-up output:

```bash
cd dist
npm publish
```

Ensure `version` in the source `package.json` is updated before building, per semver conventions.
