# @wiltech-labs/ngx-components

Shared Angular reusable UI components — small, focused pieces an app drops in anywhere, not tied to
forms or any other single concern.

## Installation

```bash
npm install @wiltech-labs/ngx-components
```

Peer dependencies: `@angular/core`, `@angular/common`. `Panel` and `Card` also need `@angular/cdk`
and `@angular/material` (they wrap `mat-expansion-panel`/`mat-card`); `Banner` needs neither — see
`CLAUDE.md` for why that's deliberate per component, not a blanket package rule.

## Usage

### Banner

A stack of info/warning/error lines, one block per message, each with an icon for its type:

```ts
import { Component } from '@angular/core';
import { Banner, type Message } from '@wiltech-labs/ngx-components';

@Component({
  selector: 'app-my-settings-page',
  imports: [Banner],
  template: `<ngx-banner [messages]="messages" />`,
})
export class MySettingsPage {
  protected readonly messages: Message[] = [
    { type: 'info', text: 'Changes how dates are typed and shown.' },
  ];
}
```

```ts
type MessageType = 'info' | 'warning' | 'error';
interface Message {
  type: MessageType;
  text: string;
}
```

Override its colours per type via `--ngx-components-banner-<type>-background` /
`-<type>-text` (Eg `--ngx-components-banner-info-background`); `error` falls back to the app's M3
theme (`--mat-sys-error-container`), `info`/`warning` fall back to a fixed light blue/amber — see
`CLAUDE.md` for why.

### Panel

A full-width expandable section on `mat-expansion-panel`. `header` is the only required input; an
optional `icon` sits on the same line as `header`, an optional `subheader` sits on the line below —
both always visible, collapsed or not. Content is projected in and only renders once expanded (the
same lazy behaviour `mat-expansion-panel` already gives you):

```html
<ngx-panel header="Billing" subheader="Manage your payment details" icon="credit_card">
  <p>Anything can go here.</p>
</ngx-panel>
```

### Card

Same header rules as `Panel` (optional `icon` + required `header` on one line, optional `subheader`
on the next), on `mat-card` instead — content is always visible, there's no expand/collapse (a card
isn't an accordion):

```html
<ngx-card header="Account" subheader="Signed in as jane.doe@example.com" icon="account_circle">
  <p>Anything can go here.</p>
</ngx-card>
```

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # Message, MessageType
    ├── banner/             # Banner
    ├── panel/              # Panel
    └── card/               # Card
```

## Status

New package: `Banner`, `Panel`, `Card`. Not yet published to npm — under development. First
consumer is this monorepo's own `apps/showcase` (`demos/components-demo`).

## Publishing

To publish this package to npm:

```bash
cd packages/components
npm run build
cd dist
npm publish
```

Ensure `version` in the source `package.json` is updated before building, per semver conventions.
No `file:` inter-package dependencies here (see root `CLAUDE.md`'s "Inter-package deps") — this
package depends on nothing else in this monorepo, so no `dist/package.json` fixup is needed before
publishing, unlike `ngx-region-settings`.
