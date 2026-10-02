import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';

import { NGX_THEMES_CONFIG, ThemeMode } from '../config/themes-config.model.js';

/**
 * Which palette family and which mode are active, persisted to `localStorage`, applied as
 * `data-theme` + `color-scheme` on <html>. Nothing re-renders on a switch — every colour is a
 * `--mat-sys-*` variable, so the browser restyles in place. The palettes themselves stay in the
 * app's SCSS (one `html[data-theme='<id>']` block per family); this only flips the attributes.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly config = inject(NGX_THEMES_CONFIG);
  private readonly prefix = this.config.storageKeyPrefix ?? 'ngx-themes';
  private readonly familyKey = `${this.prefix}.family`;
  private readonly modeKey = `${this.prefix}.mode`;

  public readonly families = this.config.families;
  public readonly family = signal(
    readStored(this.familyKey, (value) => this.isFamily(value)) ??
      this.config.defaultFamily ??
      this.families[0]?.id ??
      '',
  );
  public readonly mode = signal<ThemeMode>(
    readStored<ThemeMode>(this.modeKey, isMode) ?? this.config.defaultMode ?? 'system',
  );

  private readonly systemPrefersDark = signal(false);

  /** What's actually on screen — resolves `system` against the OS preference. */
  public readonly isDark = computed(
    () => this.mode() === 'dark' || (this.mode() === 'system' && this.systemPrefersDark()),
  );

  constructor() {
    const query = this.root.ownerDocument.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
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
      if (family) {
        this.root.setAttribute('data-theme', family);
        writeStored(this.familyKey, family);
      }
      this.root.style.colorScheme = mode === 'system' ? '' : mode;
      writeStored(this.modeKey, mode);
    });
  }

  public setFamily(id: string): void {
    if (this.isFamily(id)) this.family.set(id);
  }

  public setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  /** One-click light/dark flip from whatever is currently showing (including from `system`). */
  public toggleMode(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  private isFamily(value: string): boolean {
    return this.families.some((family) => family.id === value);
  }
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
