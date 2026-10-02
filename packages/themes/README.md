# @wiltech-labs/ngx-themes

Material 3 theme switching for Angular apps. An app offers several palette **families**, and each
family has a **light and a dark** version. The user's choice is remembered per browser.

- `ThemeService` holds signals for the family, the mode (`light` / `dark` / `system`) and `isDark`.
  It sets `data-theme="<family>"` and `color-scheme` on `<html>`.
- `<ngx-theme-switcher>` is a navbar control. One button flips light/dark. A palette menu picks
  the family or "Match system".
- `provideThemes()` registers the families.

This package does not ship any palettes. Each family is a block in the app's own SCSS. Because
every colour is a `--mat-sys-*` variable, switching restyles the page without re-rendering it.

## Usage

### 1. Palettes in the app's `styles.scss`

Generate one palette file per family with `ng generate @angular/material:theme-color`. Then use
the `color-scheme` theme type, so light and dark both come from `light-dark()`:

```scss
@use '@angular/material' as mat;
@use 'styles/themes/minimalistic' as minimalistic-theme;
@use 'styles/themes/teal' as teal-theme; // `as`: bare `teal` is a CSS colour keyword

html {
  @include mat.theme(
    (
      color: (
        primary: minimalistic-theme.$primary-palette,
        tertiary: minimalistic-theme.$tertiary-palette,
      ),
      typography: Roboto,
      density: 0,
    )
  );
  color-scheme: light dark;
}

html[data-theme='teal'] {
  @include mat.theme(
    (
      color: (
        primary: teal-theme.$primary-palette,
        tertiary: teal-theme.$tertiary-palette,
      ),
    )
  );
}
```

### 2. Register the families

```ts
import { provideThemes } from '@wiltech-labs/ngx-themes';

bootstrapApplication(AppComponent, {
  providers: [
    provideThemes({
      families: [
        { id: 'minimalistic', label: 'Minimalistic' },
        { id: 'teal', label: 'Teal' },
      ],
      defaultFamily: 'minimalistic', // optional, defaults to the first family
      defaultMode: 'system', // optional
      storageKeyPrefix: 'my-app.theme', // optional, defaults to 'ngx-themes'
    }),
  ],
});
```

If `families` is empty, the package is a light/dark toggle only and never sets `data-theme`.

### 3. Drop in the switcher

```ts
import { ThemeSwitcher } from '@wiltech-labs/ngx-themes';
```

```html
<ngx-theme-switcher />
```

You can also build your own UI with `ThemeService`: `family()`, `mode()`, `isDark()`,
`setFamily(id)`, `setMode(mode)` and `toggleMode()`.

### 4. Avoid a light flash on load (recommended)

Angular boots after the first paint, so a stored dark choice would briefly show light. Add this to
`index.html`, using the same keys as your `storageKeyPrefix`:

```html
<script>
  try {
    var family = localStorage.getItem('my-app.theme.family');
    var mode = localStorage.getItem('my-app.theme.mode');
    if (family) document.documentElement.setAttribute('data-theme', family);
    if (mode === 'light' || mode === 'dark') document.documentElement.style.colorScheme = mode;
  } catch (e) {}
</script>
```

### Text

The switcher's labels are English by default. Override `NGX_THEMES_TEXT` to translate them. It uses
the same resolver-function pattern as `NGX_NOTIFICATIONS_TEXT`:

```ts
{
  provide: NGX_THEMES_TEXT,
  useFactory: () => {
    const t = inject(TranslationsService);
    return () => ({ ...DEFAULT_THEMES_TEXT, matchSystem: t.translate('theme.matchSystem') });
  },
}
```

Family labels come from `provideThemes({ families })`.

## Publishing

To publish this package to npm:

```bash
cd packages/themes
npm run build
cd dist
npm publish
```

Update `version` in the source `package.json` before building, following semver. This package
depends on nothing else in this monorepo, so no `dist/package.json` fix-up is needed before
publishing (see root `CLAUDE.md`'s "Inter-package deps").
