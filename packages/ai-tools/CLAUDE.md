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
    │   └── ai-button/         # AiButton — gradient-filled action button
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

## Status

- New package, initial component set only (`AiSparkleIcon`, `AiPanel`, `AiTextBox`, `AiButton`).
  Services (e.g. an actual AI request layer) are intentionally not started yet.
- Not yet published to npm — under development.
- No consumers yet.
- Package name (`ai-tools`) is provisional — revisit if a better name comes up.
