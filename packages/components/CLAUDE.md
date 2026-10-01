# @wiltech-labs/ngx-components

Shared Angular reusable UI components — a grab-bag by design, unlike every other package here which
covers one specific concern (forms, modals, notifications, ...). Started 2026-10-01 for `Banner`,
joined the same day by `Panel` and `Card`. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── models/             # Message, MessageType
    ├── banner/             # Banner — one folder per component, same as ngx-ai-tools
    ├── panel/              # Panel
    └── card/               # Card
```

## Conventions

- Real Angular constructs (`@Component`) — not framework-agnostic functions. Every known consumer
  is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per component under `src/lib/` — don't let it go flat. A new component (panel, card,
  ...) gets its own folder, same precedent as `ngx-ai-tools`.
- Standalone components only, no NgModules.
- **Material dependency is a per-component decision, not a package-wide rule.** `Banner` has none,
  deliberately — same reasoning as `ngx-ai-tools`/`ngx-notifications`: colours are plain CSS
  variables with hex fallbacks (`--ngx-components-<x>, var(--mat-sys-y, #hex)`), so it renders the
  same whether or not the consuming app is Material-themed, and its icons are inline SVG
  (`currentColor` fill), not `mat-icon`. `Panel` and `Card` take the opposite call on purpose —
  asked for explicitly as "mat" components, wrapping `mat-expansion-panel`/`mat-card` rather than
  rebuilding their accordion mechanics (animation, keyboard a11y, ripple) or card elevation/shape
  from scratch, the same real-Material-dependency choice `ngx-forms`/`ngx-modals` already make for
  genuinely interactive widgets. Check each component's own reasoning before assuming either way.
- `Banner`'s `warning` state has no `--mat-sys-*` middle fallback tier
  (`--ngx-components-banner-warning-background, #fff3cd`, not `..., var(--mat-sys-??, #fff3cd)`) —
  Material 3 reserves `error`/`tertiary`/etc. roles but no canonical "warning" role, so there's
  nothing semantically correct to fall back to. `info` and `error` do have a real M3 role
  (`tertiary-container`/`error-container`) and use it as the middle tier.
- `Banner` renders the whole list itself (`[messages]="Message[]"`), not one component per message
  that the app `@for`s over — asked directly which shape to build, this one was picked because it
  matches how `ngx-notifications` owns its whole list internally, and gives one place to keep "a
  stack of banners" laid out consistently rather than every call site re-solving spacing/order.
- Each message gets `role="status"` (info) or `role="alert"` (warning/error) — info is advisory,
  warning/error are assertive enough to interrupt a screen reader. Icons are `aria-hidden`, the text
  itself carries the meaning.
- **`Panel` and `Card` share one header layout, specified directly**: `header` (required) is the
  only mandatory input; `icon` (optional) sits on the same line as `header` when present; `subheader`
  (optional) sits on its own line below both. Neither uses Material's own default title/description
  layout as-is — `mat-expansion-panel-header`'s title+description normally sit side by side on one
  row, and `mat-card-header`'s avatar sits beside a title+subtitle column, neither matching "icon
  then title on one line, subheader on the next" — so both build this with their own markup inside
  `mat-panel-title`/`mat-card-title` (a flex-column wrapper containing a flex-row for icon+title,
  then a block for subheader) instead of relying on `mat-panel-description`/the avatar slot.
- Both are full width (`:host { display: block; width: 100%; }` plus `width: 100%` on the Material
  element itself), same "fills its container" contract `ngx-forms` fields already have.
- Content is projected via plain `<ng-content>`, not `<ng-template>` — for `Panel` specifically this
  still gets `mat-expansion-panel`'s lazy-render-until-expanded behaviour for free: Angular content
  projection re-parents whatever the caller passes to wherever `<ng-content>` sits in `Panel`'s own
  template, so `MatExpansionPanel`'s internal content-query sees it as a direct content child either
  way — no need to ask the caller to wrap their content in Material's own
  `<ng-template matExpansionPanelContent>` for that.
- `Card` has no expand/collapse — its content is always visible, since a card isn't an accordion;
  `appearance="outlined"` chosen over the (deprecated) `"raised"` default.

## Status

- New package: `Banner` (`Message`/`MessageType`), `Panel`, `Card` — all added 2026-10-01. First
  consumer is this monorepo's own `apps/showcase` (`demos/components-demo`) — `Banner` is also used
  by `ngx-region-settings`'s own demo to show a locale-affects-dates explanation, though that
  specific case ended up using `ngx-forms`' plain `FieldDef.hint` instead (always-visible, no new
  component needed) rather than `Banner` (which is for separate, more prominent call-outs) — see
  root `NEXT_STEPS.md` for that discussion.
- Not yet published to npm — under development.
- No consumers yet outside this monorepo.
