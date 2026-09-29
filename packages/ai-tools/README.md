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
    <app-ai-panel title="AI Summary">
      <p>This quarter's revenue grew 12%, driven mainly by...</p>
    </app-ai-panel>
  `
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
  template: `<app-ai-text-box [(value)]="prompt" placeholder="Ask AI anything…" />`
})
export class PromptComponent {
  prompt = signal('');
}
```

## `AiButton`

A gradient-filled button for triggering an AI action.

```html
<app-ai-button label="Generate" [disabled]="loading()" (clicked)="generate()" />
```

## `AiSparkleIcon`

The 4-pointed "sparkle"/diamond glyph used to mark AI features, usable on its own.

```html
<app-ai-sparkle-icon size="20px" />
<!-- on a colored background, use currentColor instead of the built-in gradient fill -->
<app-ai-sparkle-icon size="16px" [monochrome]="true" />
```

## Theming

Every component reads its colors from CSS custom properties, so the whole look follows whatever
theme the host app sets:

```css
:root {
  --ngx-ai-gradient-start: #4f7cff;
  --ngx-ai-gradient-mid: #a855f7;
  --ngx-ai-gradient-end: #ec4899;
  --ngx-ai-surface: #ffffff; /* AiPanel/AiTextBox's inner background, inside the gradient border */
}
```

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
