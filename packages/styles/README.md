# @wiltech-labs/ngx-styles

Shared Material 3 Sass partials: a breakpoint scale, a spacing scale, and
design-system mixins (`page-title`, `banner`, `state-layer`, `focus-ring`, `list`/`list-row`,
`panel`, `badge`, ...) that read `--mat-sys-*` tokens. Ships raw `.scss` — no compile step,
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

## Logo

`src/logo/` holds the Wiltech Labs logo: a solid lab flask whose gold liquid dips into a W.
It uses the house seeds, teal `#0A7E8C` (primary) and gold from the tertiary palette. The files
ship with the package, so an app takes what it needs from
`node_modules/@wiltech-labs/ngx-styles/src/logo/`.

| File                                                      | Use                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `logo.svg`, `logo.png`                                    | Mark and wordmark, for light backgrounds. The wordmark is outlined, so no font is needed.     |
| `logo-dark.svg`, `logo-dark.png`                          | The same lockup for dark backgrounds.                                                         |
| `logo-mark.svg`, `logo-mark.png`                          | Mark only, on a transparent background. The W cut and bubbles are real transparency.          |
| `logo-mark-dark.svg`, `logo-mark-dark.png`                | Mark only, for dark backgrounds.                                                              |
| `logo-icon.svg`, `logo-icon-512.png`, `logo-icon-192.png` | App-icon tile (teal rounded square), e.g. for PWA manifest icons.                             |
| `apple-touch-icon.png`                                    | 180 px full-bleed square. iOS rounds the corners itself and turns transparency black.         |
| `favicon.ico`                                             | 16, 32 and 48 px. The 16 and 32 px frames are redrawn on a 16 px grid instead of scaled down. |
| `favicon.svg`                                             | The same 16 px grid drawing, for browsers that use an SVG favicon.                            |

To use it as a dev app's favicon without copying files, serve them from `node_modules` in
`angular.json`:

```json
"assets": [
  {
    "glob": "{favicon.ico,favicon.svg,apple-touch-icon.png}",
    "input": "node_modules/@wiltech-labs/ngx-styles/src/logo",
    "output": "/"
  }
]
```

Then in `index.html`:

```html
<link rel="icon" href="favicon.ico" sizes="32x32" />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

Every file in `src/logo/` is generated. To change the logo, edit `scripts/build-logo.js` at the
repo root and run `npm run build:logo`, not the SVGs by hand.

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
directly from source. That includes `src/logo/`.

## Status

No consumer yet.
