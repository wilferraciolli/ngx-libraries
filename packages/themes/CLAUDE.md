# @wiltech-labs/ngx-themes

Material 3 theme switching: palette families, each with light and dark. Extracted 2026-10-02 from
`apps/showcase`, where it was first built app-local to prove the shape. See root `../../CLAUDE.md`
for repo-wide conventions, and `README.md` for usage.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface
└── lib/
    ├── config/             # ThemesConfig / ThemeFamily / ThemeMode + NGX_THEMES_CONFIG, NGX_THEMES_TEXT
    ├── services/           # ThemeService
    ├── providers/          # provideThemes()
    └── components/
        └── theme-switcher/ # <ngx-theme-switcher> (ThemeSwitcher)
```

## Conventions

- **Mechanism only, no palettes.** `ThemeService` flips `data-theme` and `color-scheme` on
  `<html>`. Each family's colours are the consuming app's own `html[data-theme='<id>']` SCSS
  block. Palettes are per-customer brand data and belong with the app. If several apps end up
  sharing a palette, that goes to `ngx-styles`, not here.
- Mode is `light | dark | system`. `system` clears the inline `color-scheme`, so the stylesheet's
  `color-scheme: light dark` follows the OS. This relies on the app using M3's `color-scheme`
  theme type (every role uses `light-dark()`); with any other theme type, setting `color-scheme`
  changes nothing.
- Choices persist to `localStorage` under `<storageKeyPrefix>.family` and `.mode`. Every storage
  access is wrapped in try/catch: if storage is blocked, the theme still works for the session.
  The app's `index.html` pre-paint script must read the same keys. That script stays app-side
  because it has to run before any bundle loads.
- `provideThemes()` eagerly constructs `ThemeService` (`provideAppInitializer`), so the stored
  choice applies even when no switcher is rendered. Without `provideThemes()`, the default config
  has no families, which means light/dark only.
- Real Material dependency (`mat-icon-button`, `mat-menu`, `mat-tooltip`), the same choice as
  `ngx-forms` and `ngx-modals` for interactive widgets. Icons are Material Symbols ligatures, so the
  app must load that font (every consumer here already does). No sibling `ngx-*` dependencies.
- Text is overridable through `NGX_THEMES_TEXT` (resolver function, same as
  `NGX_NOTIFICATIONS_TEXT`).

## Status

- Built 2026-10-02. The only consumer is `apps/showcase`, which has four families: minimalistic,
  teal, magenta and red-yellow. It also has a Storybook story (`ngx-themes/ThemeSwitcher`).
- Not yet published to npm.
