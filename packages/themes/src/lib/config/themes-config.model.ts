import { InjectionToken } from '@angular/core';

/** Light / dark force `color-scheme` on <html>; `system` follows the OS/browser preference. */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeFamily {
  /** Set as `data-theme` on <html> — matches the app's own `html[data-theme='<id>']` SCSS block. */
  id: string;
  label: string;
}

export interface ThemesConfig {
  /** Every palette family the app offers. Empty (the default) means light/dark only — no
   *  `data-theme` is set and the switcher hides its palette menu. */
  families: readonly ThemeFamily[];
  /** Defaults to the first family. */
  defaultFamily?: string;
  /** Defaults to `system`. */
  defaultMode?: ThemeMode;
  /** `localStorage` keys are `<prefix>.family` / `<prefix>.mode`. Defaults to `ngx-themes`. An app
   *  with a pre-paint script in its `index.html` must read the same two keys. */
  storageKeyPrefix?: string;
}

export const DEFAULT_THEMES_CONFIG: ThemesConfig = { families: [] };

export const NGX_THEMES_CONFIG = new InjectionToken<ThemesConfig>('NGX_THEMES_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_THEMES_CONFIG,
});
