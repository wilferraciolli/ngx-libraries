# @wiltech-labs/ngx-ai-tools

Shared Angular AI-flavoured components: gradient panels, text boxes and buttons with the AI-assist
look and feel seen in Copilot/Gemini-style UIs.

## Installation

```bash
npm install @wiltech-labs/ngx-ai-tools
```

Peer dependencies: `@angular/core`, `@angular/common` (both `^22`). No Material dependency — every
component is styled with plain CSS.

## `AiPanel`

A container with a smooth animated gradient running around its border (a rotating
`conic-gradient`, not a static fill).

```ts
import { Component } from '@angular/core';
import { AiPanel } from '@wiltech-labs/ngx-ai-tools';

@Component({
  selector: 'app-summary',
  imports: [AiPanel],
  template: `
    <ngx-ai-panel title="AI Summary">
      <p>This quarter's revenue grew 12%, driven mainly by...</p>
    </ngx-ai-panel>
  `,
})
export class SummaryComponent {}
```

`[title]` is optional — omit it to render just the bordered panel with your content, no header.

## `AiTextBox`

A text box with the same animated gradient border, for an "ask AI" style prompt input.

```ts
import { Component, signal } from '@angular/core';
import { AiTextBox } from '@wiltech-labs/ngx-ai-tools';

@Component({
  selector: 'app-prompt',
  imports: [AiTextBox],
  template: `<ngx-ai-text-box
    [(value)]="prompt"
    label="Ask about your orders"
    placeholder="Ask AI anything…"
  />`,
})
export class PromptComponent {
  prompt = signal('');
}
```

## `AiButton`

A gradient-filled button for triggering an AI action.

```html
<ngx-ai-button label="Generate" [disabled]="loading()" (clicked)="generate()" />
```

## `AiSparkleIcon`

The 4-pointed "sparkle"/diamond glyph used to mark AI features, usable on its own.

```html
<ngx-ai-sparkle-icon size="20px" />
<!-- on a colored background, use currentColor instead of the built-in gradient fill -->
<ngx-ai-sparkle-icon size="16px" [monochrome]="true" />
```

## Theming

The gradient is built from the app's M3 roles — `primary` → `tertiary` → `secondary` — so it follows
the theme and dark mode with no setup. `AiButton` is an M3 filled button (`corner-full`,
`label-large`, `on-primary` text), and the panel/text box surface is `surface`.

The rotating border is the house style's one deliberate ambient animation; it stops under
`prefers-reduced-motion`.

For a genuine one-off, override with tokens (never hex values):

```css
.MyPage-assistant {
  --ngx-ai-gradient-end: var(--mat-sys-primary-container);
}
```

Variables: `--ngx-ai-gradient-start`, `--ngx-ai-gradient-mid`, `--ngx-ai-gradient-end`,
`--ngx-ai-surface`.

## When to use it

AI _interaction_ surfaces — where the user asks the AI something or reads its answer. Static AI
markers (a nav destination, a badge) use the `tertiary-container` role instead. `AiButton` counts as
the view's one filled button.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── components/       # AiSparkleIcon, AiPanel, AiTextBox, AiButton
    └── shared/styles/     # Shared animated gradient-border mixin
```

## Status

Not yet published to npm — under development. Component look-and-feel only for now; an AI request
service layer is planned but not started.

## Publishing

To publish this package to npm:

```bash
cd packages/ai-tools
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
