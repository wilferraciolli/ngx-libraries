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

## `AiGenerate`

A prompt box and **Generate** button in an `AiPanel`. It sends the prompt to your app's
`AiGenerator` and emits the `{ title, body }` it returns. Where that content goes (form fields, a
preview, a clipboard copy) is up to you.

### 1. Provide a generator

The library never calls an AI provider itself. Your generator calls **your backend**, which holds
the provider's API key (Groq, Cloudflare Workers AI, ...) and the system prompt. Keys must never
ship in the browser bundle.

```ts
// app.config.ts
import { inject } from '@angular/core';
import { ApiClientService } from '@wiltech-labs/ngx-api-client';
import { provideAiGenerator } from '@wiltech-labs/ngx-ai-tools';
import type { AiGenerateResult } from '@wiltech-labs/ngx-ai-tools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAiGenerator(() => {
      const api: ApiClientService = inject(ApiClientService);
      return {
        generate: (request) => api.post<'post', AiGenerateResult>('post', '/ai/generate', request),
      };
    }),
  ],
};
```

The contract:

```ts
interface AiGenerateRequest {
  prompt: string;
}
interface AiGenerateResult {
  title: string;
  body: string;
}
interface AiGenerator {
  generate(request: AiGenerateRequest, signal: AbortSignal): Promise<AiGenerateResult>;
}
```

`signal` aborts if the component is destroyed mid-request; pass it on to `fetch` where you can.
`provideAiGenerator()` returns a normal provider, so it also works in one component's `providers`.

**Backend tip:** use the provider's JSON mode (Groq `response_format: { type: 'json_object' }`,
Workers AI JSON mode) so the title and body come back reliably split, and keep tone/length rules
("LinkedIn post, under 3,000 characters, no markdown") in the backend's system prompt.

### 2. Use it

```ts
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { AiGenerate } from '@wiltech-labs/ngx-ai-tools';
import type { AiGenerateResult } from '@wiltech-labs/ngx-ai-tools';
import { FormFieldType, TextField, TextareaField, toSchema } from '@wiltech-labs/ngx-forms';

@Component({
  selector: 'app-post-composer',
  imports: [AiGenerate, TextField, TextareaField],
  template: `
    <ngx-ai-generate heading="Write a post" (generated)="onGenerated($event)" />
    <ngx-text-field [fieldDef]="fields.title" [field]="postForm.title" />
    <ngx-textarea-field [fieldDef]="fields.body" [field]="postForm.body" />
  `,
})
export class PostComposerComponent {
  fields = {
    title: { name: 'title', type: FormFieldType.TEXT, label: 'Title' },
    body: { name: 'body', type: FormFieldType.TEXTAREA, label: 'Post' },
  };
  model = signal({ title: '', body: '' });
  postForm = form(this.model, toSchema(Object.values(this.fields)));

  onGenerated(result: AiGenerateResult): void {
    this.model.set(result);
  }
}
```

| Input             | Default                                       |
| ----------------- | --------------------------------------------- |
| `heading`         | `'Generate with AI'`                          |
| `label`           | `'Describe what to write'` (accessible name)  |
| `placeholder`     | `'Tell the AI what to write about…'`          |
| `buttonLabel`     | `'Generate'`                                  |
| `generatingLabel` | `'Generating…'`                               |
| `errorMessage`    | `'Something went wrong. Please try again.'`   |
| `[(prompt)]`      | `''` (two-way, to prefill or keep the prompt) |

Outputs: `generated` (`AiGenerateResult`), `failed` (the rejection reason, for logging; the
message is shown either way).

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
    ├── components/       # AiSparkleIcon, AiPanel, AiTextBox, AiButton, AiGenerate
    ├── generation/       # AiGenerator, NGX_AI_GENERATOR, provideAiGenerator()
    └── shared/styles/     # Shared animated gradient-border mixin
```

## Status

`1.0.0` is published (the four look-and-feel components). `1.1.0` adds `AiGenerate` and the
`AiGenerator` contract; not yet published.

## Publishing

To publish this package to npm:

```bash
cd packages/ai-tools
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
