# @wiltech-labs/ngx-dates

Shared Angular date/time display helpers: a `relativeTime` pipe and `RelativeTimeService`, built on
[Temporal](https://tc39.es/proposal-temporal/) and `Intl.RelativeTimeFormat`. Locale-pluggable: by
default it reads the browser's own language, and wiring it to
[`@wiltech-labs/ngx-i18n`](../i18n) (one line, below) makes text update instantly on a language
switch too, the same as everything else translated through that package.

## Installation

```bash
npm install @wiltech-labs/ngx-dates
```

Peer dependencies: `@angular/core`, `@angular/common` (both `^22`). `temporal-polyfill` is
installed automatically as a regular dependency of this package.

### Locale

`NGX_DATES_LOCALE` (an `InjectionToken<() => string>`) decides which locale is formatted against —
it defaults to `navigator.language` and never changes on its own. Override it to wire in
`@wiltech-labs/ngx-i18n`'s active locale, so a language switch there updates relative-time text too:

```ts
// app.config.ts
import { inject } from '@angular/core';
import { NGX_DATES_LOCALE } from '@wiltech-labs/ngx-dates';
import { I18nService } from '@wiltech-labs/ngx-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    {
      provide: NGX_DATES_LOCALE,
      useFactory: () => {
        const i18n = inject(I18nService);
        return () => i18n.locale();
      }
    }
  ]
};
```

This package has no dependency on `ngx-i18n` (or on any particular i18n setup) — the resolver is a
plain function so the two compose without either package needing to know the other exists.

## Usage

```ts
import { Component } from '@angular/core';
import { RelativeTimePipe } from '@wiltech-labs/ngx-dates';

@Component({
  selector: 'app-comment',
  imports: [RelativeTimePipe],
  template: `<time>{{ comment.postedAt | relativeTime }}</time>`
})
export class CommentComponent {
  protected readonly comment = { postedAt: '2026-09-30T08:15:00Z' };
}
```

Renders "5 minutes ago", "yesterday", "in 2 days", etc. — updates on its own as time passes (more
often for a fresh value, less often for an old one) and re-renders instantly on a language switch,
without the template doing anything beyond the pipe itself.

Accepts a UTC instant string (`'2024-03-31T01:30:00Z'`), a `Date`, or a `Temporal.Instant` directly
— the same wire format `@wiltech-labs/ngx-forms`' instant-date-time field uses, so a value read
from that field needs no conversion first.

### From logic

```ts
import { Component, inject } from '@angular/core';
import { RelativeTimeService } from '@wiltech-labs/ngx-dates';

@Component({ /* ... */ })
export class NotificationComponent {
  private readonly relativeTime = inject(RelativeTimeService);

  protected toastText(postedAt: string): string {
    return `New comment ${this.relativeTime.relativeTime(postedAt)}`;
  }
}
```

Use `RelativeTimeService.relativeTime()` for a one-off value (a toast, a log line); use the pipe in
a template, which stays live as time passes without the component re-deriving it itself.

### Options

`Intl.RelativeTimeFormatOptions` pass straight through, e.g. to force a unit or numeric style:

```html
{{ comment.postedAt | relativeTime: { numeric: 'always' } }}  <!-- "1 day ago" instead of "yesterday" -->
```

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── services/           # RelativeTimeService
    ├── pipes/              # RelativeTimePipe ('relativeTime')
    └── utils/              # toInstant(), pickTier() — the shared "time ago" unit ladder
```

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/dates
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
