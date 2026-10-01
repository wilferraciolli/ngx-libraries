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
theme) as `@wiltech-labs/ngx-forms` `SelectField`s — no need to build this form's layout, dirty-check
or submit wiring yourself. It does **not** decide what each option's label says or which value it's
bound to: `options` takes ready-made `FieldOption[]` (ngx-forms' own `{label, value}` type) per field,
already resolved — and, if you're showing translated text, already translated — by you. Same boundary
`ngx-forms`' own date/time fields draw around the browser's locale (never defaulted to it — see that
package's `NGX_FORMS_LOCALE`): this component never reaches for anything ambient on its own, the app
controls it explicitly.

`RegionSettingsStore.options()` gives you the raw `{value, viewValue}` pairs straight from the API's
own metadata (see "Settings screens" above) — map those into `FieldOption[]` yourself, applying
whatever translation your app uses:

```ts
protected readonly fieldOptions = computed<RegionSettingsFieldOptions>(() => {
  const options = this.store.options();
  return {
    timezone: options.timezone?.map((o) => ({ label: o.viewValue, value: o.value })),
    language: options.language?.map((o) => ({
      label: this.i18n.translate(o.viewValue),
      value: o.value,
    })),
    // ...locale, currency, theme the same way
  };
});
```

```html
<ngx-region-settings-form
  [settings]="store.settings()"
  [options]="fieldOptions()"
  [saving]="store.saving()"
  (save)="store.save($event)"
/>
```

The component only emits `save` with the edited payload — it never calls the store itself, so saving
(and whatever happens after, e.g. reloading) stays entirely the app's call.

Override the Save/Saving button text and the five field labels by providing
`NGX_REGION_SETTINGS_FORM_TEXT` (a `() => RegionSettingsFormText` resolver — same pattern as
`ngx-notifications`' text token); everything stays English by default.

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

`ng-packagr` copies `dependencies` verbatim into `dist/package.json`, including this package's own
`file:../api-client/dist` / `file:../auth/dist` / `file:../forms/dist` entries (see this package's
`CLAUDE.md` for why they're `file:` references at all) — those are meaningless outside this monorepo.
`npm run build`'s `postbuild` script (`scripts/fix-dist-file-deps.js`) rewrites them to real published
version ranges automatically, right after `ng-packagr` finishes — **not a separate step to remember**.
This was a manual, easy-to-forget hand-edit through `1.0.1`–`1.0.3` (all three published with the raw,
meaningless `file:` paths still in `dependencies` as a result); wiring it into `postbuild` instead of a
README instruction is the actual fix, since a step nobody's forced to run eventually gets skipped. If
you ever need to fix up an already-built `dist/` without rebuilding, `npm run fix-dist-file-deps`
from the repo root does the same rewrite on demand (optionally scoped to one package:
`npm run fix-dist-file-deps -- packages/region-settings`).

Then publish the output:

```bash
cd dist
npm publish
```

Ensure `version` in the source `package.json` is updated before building, per semver conventions —
`1.0.1`–`1.0.3` are unusable (published with `file:` deps that don't resolve outside this monorepo);
don't depend on them.
