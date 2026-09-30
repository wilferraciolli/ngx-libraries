# packages/styles

`@wiltech-labs/ngx-styles` — shared Sass partials, ported from
`insurly-ui`'s `src/styles/*` (also embedded in
`docs/ANGULAR_APP_CONVENTIONS.md`'s Foundations section, which is the
source of truth for their content — keep this package and that doc in sync
if the mixins change).

## Different kind of package — read before touching the checklist

Root `CLAUDE.md`'s "New package checklist" assumes `ng-packagr` (a
`ng-package.json`, a `tsconfig.json`, a `src/public-api.ts`). None of that
applies here: this package has no TypeScript, no Angular decorators,
nothing for Ivy to compile. It's four `.scss` files, published as static
source. `package.json` has no `main`/`types`/`build` script — the root
`build`/`build:packages`/`typecheck` scripts skip it via `--if-present`,
and that's correct, not a gap.

## What's here

- `src/_breakpoints.scss` — `sm`/`md`/`lg` scale, `bp.up()`/`bp.down()`
  mixins.
- `src/_spacing.scss` — 4px-unit `space()` function, responsive padding
  steps.
- `src/_ui.scss` — M3 mixins (`page-title`, `section-title`,
  `supporting-text`, `banner`, `state-layer`, `focus-ring`, `fab-position`,
  `empty-state`, `filled-icon-button`, `danger-button`). Everything reads
  `--mat-sys-*` tokens (emitted by the consuming app's own `mat.theme()`
  call) — never a hardcoded colour/type/shape value.
- `src/theme-colors.template.scss` — **not** `@use`-able from
  `node_modules` (no leading underscore, deliberately not a Sass partial).
  A brand palette is per-app, meant to be copied into the consumer's own
  `src/styles/_theme-colors.scss` and regenerated via
  `ng generate @angular/material:theme-color`, not shared verbatim like the
  other three files. See README's "`_theme-colors.scss`" section.

## The `--app-duration-short`/`--app-ease-standard` coupling

`_ui.scss`'s `state-layer` mixin reads `var(--app-duration-short)` and
`var(--app-ease-standard)` — plain CSS custom properties, not `--mat-sys-*`
tokens Material emits. This package doesn't define them; the assumption is
that the consuming app's own `styles.scss` `:root` already does, alongside
its other app-specific constants (`--app-page-max-width`, `--app-gutter`,
...) — see `docs/ANGULAR_APP_CONVENTIONS.md`'s Foundations `styles.scss`
embed. This was a real design choice, not an oversight: those two motion
tokens are genuinely app-owned (an app could reasonably want different
easing/duration), the same way `--app-page-max-width` is, so they don't
belong in a shared partial the way `--mat-sys-*` tokens (owned by
`mat.theme()`, identical in shape across every app) do. Don't "fix" this by
having `ngx-styles` emit its own copy of these two custom properties —
that would just create a second source of truth apps could drift from
their own `styles.scss` value.

## Not wired into the showcase app

Unlike every other package here, this one has no showcase demo route.
`apps/showcase` uses plain `.css` (no M3 theme foundation —
`_theme-colors.scss`/`mat.theme()` — set up), so there's nothing for these
mixins to plug into without first building out that foundation in the demo
app, which is out of scope for this package. No consumer yet either way —
see README "Status".

## Open, not yet decided

- Whether `_breakpoints.scss`/`_spacing.scss`'s scale should ever become
  configurable (e.g. an app with different breakpoints) — no request for
  this yet, and the M3 window-size-class values are a reasonable default
  most apps won't want to change. Don't add configurability speculatively.
