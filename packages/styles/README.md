# @wiltech-labs/ngx-styles

Shared Material 3 Sass partials: a breakpoint scale, a spacing scale, and
design-system mixins (`page-title`, `banner`, `state-layer`, `focus-ring`,
...) that read `--mat-sys-*` tokens. Ships raw `.scss` — no compile step,
no `ng-packagr`, no TypeScript. See this package's `CLAUDE.md` for why.

## Setup

Add this package's `src` to your app's Sass include paths, in
`angular.json`:

```json
"architect": {
  "build": {
    "options": {
      "stylePreprocessorOptions": {
        "includePaths": ["node_modules/@wiltech-labs/ngx-styles/src"]
      }
    }
  }
}
```

Then, from any stylesheet in your app:

```scss
@use 'breakpoints' as bp;
@use 'spacing';
@use 'ui';

.MyComponent-title {
  @include ui.page-title;
}

.MyComponent-panel {
  padding: spacing.space(4); // 16px

  @include bp.up(md) {
    padding: spacing.space(6); // 24px
  }
}
```

This mirrors how `insurly-ui` already used these partials locally (`src/styles`
on the include path) — only the resolution source changes, from a local
folder to `node_modules`.

`ui.scss`'s `state-layer` mixin also reads two plain CSS custom properties,
`--app-duration-short`/`--app-ease-standard`, that this package does not
define — your own `styles.scss` `:root` already sets these alongside your
other app-specific layout constants (`--app-page-max-width`, `--app-gutter`,
...), per `docs/ANGULAR_APP_CONVENTIONS.md`'s Foundations `styles.scss`. No
action needed if you're already following that doc.

## `_theme-colors.scss`

`src/theme-colors.template.scss` is **not** meant to be `@use`d from
`node_modules` — copy it into your own app as `src/styles/_theme-colors.scss`
and regenerate it for your brand:

```
ng generate @angular/material:theme-color
```

A colour palette is a per-app brand seed, not shared logic — see
`docs/ANGULAR_APP_CONVENTIONS.md`: "keep the house seeds... change them only
for a genuinely different brand." That's also why the file has no leading
underscore (a Sass partial's naming convention): it isn't part of this
package's `@use` surface.

## Why no `ng-packagr`

Every other package in this monorepo builds with `ng-packagr` (Angular
Package Format) because it ships `@Injectable`/`@Component`/`@Pipe` classes
that need Ivy's partial compilation to be consumable by another Angular
app's build. This package has none of that — it's pure Sass, so there's
nothing for `ng-packagr` to compile. It publishes straight from `src/`,
same as any plain npm package shipping static files.

## Publishing

```bash
cd packages/styles
npm publish
```

No build step — `files: ["src"]` in `package.json` is what gets published,
directly from source.

## Status

No consumer yet.
