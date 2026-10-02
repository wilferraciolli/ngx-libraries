import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

/** Light / dark force `color-scheme` on <html>; `system` follows the OS/browser preference. */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeFamily {
  /** Matches a `html[data-theme='<id>']` block in src/styles.scss. */
  id: string;
  label: string;
}

/**
 * Every palette family the app offers. Adding one is two steps, no code changes here beyond the
 * entry: generate its palette into `src/styles/themes/` (`ng generate
 * @angular/material:theme-color`), then add its `html[data-theme='<id>']` block to
 * `src/styles.scss`. Each family gets light and dark for free — see the header comment there.
 */
export const THEME_FAMILIES: readonly ThemeFamily[] = [
  { id: 'minimalistic', label: 'Minimalistic' },
  { id: 'teal', label: 'Teal' },
];

const DEFAULT_FAMILY = 'minimalistic';
const DEFAULT_MODE: ThemeMode = 'system';

// Also read by the inline script in src/index.html, which applies the stored choice before first
// paint (so a dark-mode user never sees a light flash) — keep the two in sync.
const FAMILY_KEY = 'showcase.theme.family';
const MODE_KEY = 'showcase.theme.mode';

/**
 * App-local for now (not a library): which palette family and which mode are active, persisted to
 * `localStorage`, applied as `data-theme` + `color-scheme` on <html>. Nothing re-renders on a
 * switch — every colour is a `--mat-sys-*` variable, so the browser restyles in place.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;

  public readonly families = THEME_FAMILIES;
  public readonly family = signal(readStored(FAMILY_KEY, isFamily) ?? DEFAULT_FAMILY);
  public readonly mode = signal<ThemeMode>(readStored<ThemeMode>(MODE_KEY, isMode) ?? DEFAULT_MODE);

  private readonly systemPrefersDark = signal(false);

  /** What's actually on screen — resolves `system` against the OS preference. */
  public readonly isDark = computed(
    () => this.mode() === 'dark' || (this.mode() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    const query = this.root.ownerDocument.defaultView?.matchMedia('(prefers-color-scheme: dark)');
    if (query) {
      this.systemPrefersDark.set(query.matches);
      const onChange = (event: MediaQueryListEvent): void =>
        this.systemPrefersDark.set(event.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }

    effect(() => {
      const family = this.family();
      const mode = this.mode();
      this.root.setAttribute('data-theme', family);
      this.root.style.colorScheme = mode === 'system' ? '' : mode;
      writeStored(FAMILY_KEY, family);
      writeStored(MODE_KEY, mode);
    });
  }

  public setFamily(id: string): void {
    if (isFamily(id)) this.family.set(id);
  }

  public setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  /** One-click light/dark flip from whatever is currently showing (including from `system`). */
  public toggleMode(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }
}

function isFamily(value: string): boolean {
  return THEME_FAMILIES.some((family) => family.id === value);
}

function isMode(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

// Storage can be unavailable (private mode, blocked site data) — the theme still works for the
// session, it just isn't remembered.
function readStored<T extends string>(key: string, isValid: (value: string) => boolean): T | null {
  try {
    const value = localStorage.getItem(key);
    return value !== null && isValid(value) ? (value as T) : null;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // See readStored.
  }
}
