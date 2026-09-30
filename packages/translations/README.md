# @wiltech-labs/ngx-translations

Shared Angular translations: instant (no-reload) language switching on
[Transloco](https://jsverse.gitbook.io/transloco), a `t()` service method and a `t` pipe, and
locale-aware date/number formatting. The app depends on this package alone — it never imports
`@jsverse/transloco` directly, so the engine underneath can change without touching a template.

## Installation

```bash
npm install @wiltech-labs/ngx-translations
```

Peer dependencies: `@angular/core`, `@angular/common` (both `^22`). `@jsverse/transloco` is
installed automatically as a regular dependency of this package.

## Setup

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTranslations } from '@wiltech-labs/ngx-translations';
import en from './translations/en-GB.json';
import el from './translations/el-GR.json';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideTranslations({
      locales: ['en-GB', 'el-GR'],
      defaultLocale: 'en-GB',
      dictionaries: { 'en-GB': en, 'el-GR': el }
    })
  ]
};
```

Each dictionary is one flat, namespaced object per locale, merged ahead of time — bundled at build
time (a plain JSON import) rather than fetched, so there's no loading state and no network round
trip for a small, finite set of locales:

```json
{
  "common": { "buttons": { "save": "Save", "cancel": "Cancel" } },
  "flight": { "departure": "Departure" }
}
```

A key is `"<namespace>.<...path>"`, e.g. `'common.buttons.save'`.

### Many locales, or translations served by the backend

Provide a `loader` instead of `dictionaries` — a class implementing Transloco's `TranslocoLoader`
(re-exported by this package, so there's no need to import `@jsverse/transloco` for the type):

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Translation, TranslocoLoader } from '@wiltech-labs/ngx-translations';

@Injectable()
export class ApiTranslationsLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/api/translations/${lang}`);
  }
}

provideTranslations({ locales: ['en-GB', 'el-GR'], defaultLocale: 'en-GB', loader: ApiTranslationsLoader });
```

### Resolving the signed-in user's language

`resolveLocale` is read inside a `computed()`, so it can close over the app's own signals — an
async source (a profile that loads after sign-in) takes effect the moment it resolves, the same as
an explicit language switch:

```ts
provideTranslations({
  locales: ['en-GB', 'el-GR'],
  defaultLocale: 'en-GB',
  dictionaries: { 'en-GB': en, 'el-GR': el },
  // Session override (see setLocale()) always wins over this.
  resolveLocale: () => inject(CurrentUserStore).profile()?.language,
  // Fire-and-forget — persist however the app likes. Never blocks or reverts the switch.
  persistLocale: (locale) => void inject(CurrentUserStore).updateProfile({ language: locale })
});
```

## Usage

```ts
import { Component, inject } from '@angular/core';
import { TranslationsService, TPipe } from '@wiltech-labs/ngx-translations';

@Component({
  selector: 'app-flight-form',
  imports: [TPipe],
  template: `
    <h1>{{ 'flight.departure' | t }}</h1>
    <p>{{ 'flight.seatsLeft' | t: { count: seatsLeft } }}</p>
    <button (click)="save()">{{ 'common.buttons.save' | t }}</button>
  `
})
export class FlightFormComponent {
  private readonly translations = inject(TranslationsService);
  protected readonly seatsLeft = 3;

  protected save(): void {
    // A value, not a template — for logic that needs the string itself.
    toast.show(this.translations.t('flight.saved'));
  }
}
```

- **`| t`** in a template — stays live across a language switch under `OnPush`, without the
  template needing to read a signal or an `Observable` itself.
- **`TranslationsService.t(key, params?)`** — the instant translated value, for logic: a `computed()`, a
  toast message, an id worked out to a key at runtime.

### Switching language

```ts
protected readonly translations = inject(TranslationsService);

protected onLanguageChange(locale: string): void {
  this.translations.setLocale(locale); // instant — no reload; persists in the background
}
```

`TranslationsService.locale` is a `Signal<string>` — the resolution order is this session's `setLocale()`
choice, then `resolveLocale()`, then `defaultLocale`. `supportedLocales()` lists every configured
locale, for a language switcher.

### Formatting

```ts
this.translations.formatDate(flight.departure);                                    // "31/12/2026, 09:00"
this.translations.formatDate(flight.departure, { dateStyle: 'medium' });           // "31 Dec 2026"
this.translations.formatNumber(flight.price, { style: 'currency', currency: 'GBP' }); // "£249.00"
```

Both read `Intl` directly against the current locale — not `LOCALE_ID` or Material's
`DateAdapter`, which are fixed at bootstrap and can't react to an instant switch.

## Translating an id from the API

The API sends stable ids, never pre-formatted display text. Key convention:
`'metadata.<field>.<id>'`, e.g. `translations.t('metadata.status.active')` for a `status` field's `active`
id — pairs with `@wiltech-labs/ngx-api-client`'s `MetadataService`/`convertIdToValues` pipe.

## Missing translations

A missing key falls back to rendering the key itself (visible, debuggable, never a blank string) —
Transloco's own `missingHandler`, configured by `provideTranslations()`.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── config/            # NgxTranslationsConfig, LocaleResolver, NGX_TRANSLATIONS_CONFIG token
    ├── providers/         # provideTranslations(), BundledTranslationsLoader (the default loader)
    ├── services/          # TranslationsService — locale, setLocale(), t(), formatDate()/formatNumber()
    └── pipes/             # TPipe ('t')
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/translations
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
