import { InjectionToken } from '@angular/core';

export interface ThemesText {
  /** The light/dark button's accessible name — receives what's currently on screen. */
  toggleModeLabel: (isDark: boolean) => string;
  /** The light/dark button's tooltip. */
  toggleModeTooltip: (isDark: boolean) => string;
  /** The palette button's accessible name. */
  chooseTheme: string;
  /** The palette button's tooltip. */
  themeTooltip: string;
  matchSystem: string;
}

export const DEFAULT_THEMES_TEXT: ThemesText = {
  toggleModeLabel: (isDark) => (isDark ? 'Switch to light mode' : 'Switch to dark mode'),
  toggleModeTooltip: (isDark) => (isDark ? 'Light mode' : 'Dark mode'),
  chooseTheme: 'Choose theme',
  themeTooltip: 'Theme',
  matchSystem: 'Match system',
};

/**
 * Same resolver-function pattern as `ngx-notifications`' `NGX_NOTIFICATIONS_TEXT` — override it
 * (e.g. wired to `ngx-translations`) to translate it; leave it unset and it stays English. Family
 * labels aren't here — they come from `ThemesConfig.families`.
 */
export const NGX_THEMES_TEXT = new InjectionToken<() => ThemesText>('NGX_THEMES_TEXT', {
  providedIn: 'root',
  factory: () => () => DEFAULT_THEMES_TEXT,
});
