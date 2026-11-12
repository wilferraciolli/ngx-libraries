# @wiltech-labs/ngx-ai-tools

Shared Angular AI-flavoured components — gradient panels, text boxes and buttons with the AI-assist
look and feel. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── components/
    │   ├── ai-sparkle-icon/   # AiSparkleIcon — the 4-pointed "sparkle"/diamond AI glyph
    │   ├── ai-panel/          # AiPanel — animated-gradient-border container
    │   ├── ai-text-box/       # AiTextBox — animated-gradient-border text input
    │   ├── ai-button/         # AiButton — gradient-filled action button
    │   └── ai-generate/       # AiGenerate — prompt + Generate button, emits { title, body }
    ├── generation/            # AiGenerator contract, NGX_AI_GENERATOR, provideAiGenerator()
    └── shared/styles/          # Shared animated gradient-border mixin
```

## Conventions

- Real Angular constructs (`@Component`) — not framework-agnostic functions. Every known consumer
  is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/` — don't let it go flat. A new concern (e.g. a chat
  bubble, a loading indicator styled for this look) gets its own component folder.
- Standalone components only, no NgModules.
- The "AI" look is a gradient built from the app's M3 roles (`primary` → `tertiary` → `secondary`),
  defined once in `shared/styles/_ai-tokens.scss`; `--ngx-ai-gradient-*`/`--ngx-ai-surface` override
  it. No Material dependency — the tokens are just CSS variables with hex fallbacks.
- The rotating border is the house style's one deliberate ambient animation (decided 2026-09-29,
  an exception to the conventions' motion rule); it must keep stopping under
  `prefers-reduced-motion`.
- The animated border (`AiPanel`, `AiTextBox`) is a rotating `conic-gradient`, not a static
  gradient fill — see `shared/styles/_gradient-border.mixins.scss`. Components that only need the
  colours (`AiButton`, `AiSparkleIcon`) `@use` `_ai-tokens.scss`, not the border partial, so they
  don't carry the `@property`/`@keyframes`. SVG `stop-color`s are set from CSS classes, because
  `var()` isn't reliable in SVG presentation attributes. It uses `@property` to animate
  the gradient's angle directly; both the `@property` and `@keyframes` at-rules live in that one
  partial and get pulled into each component's own compiled CSS via `@use` (Angular gives every
  component its own encapsulated stylesheet, so they can't be declared once globally).
- `AiSparkleIcon` fills with the gradient by default; pass `[monochrome]="true"` when placing it on
  a background that's already gradient-colored (e.g. inside `AiButton`) so it uses `currentColor`
  instead of fighting the background for contrast.
- **AI requests go through the app, never straight to a provider (2026-11-12).** `AiGenerate`
  calls whatever `AiGenerator` the app provides (`provideAiGenerator(() => ...)`); the library
  knows nothing about Groq, Workers AI or keys. The app's generator calls its own backend, which
  holds the provider key and the system prompt (brand voice, length, "no markdown"), so either can
  change without republishing this package. Same app-pluggable-token pattern as `NGX_DATES_LOCALE`.
- `AiGenerator.generate()` returns a `Promise`, not an `Observable` — matches `ApiClientService`
  (whose methods are all `Promise`s), so an implementation is one `api.post(...)` line, and this
  package needs no `rxjs` peer dependency. Cancellation is an `AbortSignal`, aborted when
  `AiGenerate` is destroyed; a result or error arriving after that is dropped.
- The result is structured `{ title, body }`, not one string: the prompt is an instruction, not a
  headline, so the backend should use the provider's JSON mode and return both. The prompt stays
  in `AiGenerate` (two-way `prompt` model) so the user can tweak and regenerate.
- `AiGenerate` only emits; it doesn't own the fields the content lands in. The showcase/Storybook
  composer feeds it into `ngx-forms`' `TextField` + `TextareaField` — composed in the app, so this
  package still has no sibling `ngx-*` dependency (root `CLAUDE.md`, "Inter-package deps").
  Plain-text textarea, not a rich editor, on purpose: social posts are plain text anyway.
- Every string on `AiGenerate` is an input with an English default (same as `AiTextBox`), no text
  token. While running, the button shows `generatingLabel` and a visually-hidden `role="status"`
  announces it; a rejection shows `errorMessage` in a `role="alert"` and emits `failed`.
- No streaming yet — one request, one response. Adding it later means a new optional method on
  `AiGenerator`, not a breaking change.

## Status

- `1.0.0` published: `AiSparkleIcon`, `AiPanel`, `AiTextBox`, `AiButton`.
- `1.1.0` (not yet published): `AiGenerate` + `AiGenerator`/`NGX_AI_GENERATOR`/
  `provideAiGenerator()`. Demoed in `apps/showcase` (`/ai-tools`, post composer with a fake
  generator) and Storybook (`ngx-ai-tools/AiGenerate`).
- No consumers yet outside this monorepo. No backend endpoint exists yet either — each app builds
  its own (e.g. a Cloudflare Worker: `POST /ai/generate { prompt }` → `{ title, body }`).
- Package name (`ai-tools`) is provisional — revisit if a better name comes up.
