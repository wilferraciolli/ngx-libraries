import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal, type Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CATEGORICAL_DARK, CATEGORICAL_LIGHT } from '../constants/categorical-palette.constant';

/** Concrete colours and font for one render — a canvas can't read CSS custom properties. */
export interface GraphTheme {
  /** Categorical series colours, slot 1 first. */
  series: readonly string[];
  /** Titles, legend and values (`on-surface`). */
  text: string;
  /** Axis ticks and secondary labels (`on-surface-variant`). */
  mutedText: string;
  /** Grid hairlines (`outline-variant`). */
  grid: string;
  /** The surface the chart sits on — slice separators. */
  surface: string;
  tooltipBackground: string;
  tooltipText: string;
  fontFamily: string;
  fontSize: number;
}

/** Used where there's no DOM to resolve against (SSR, unit tests without styles). */
export const FALLBACK_GRAPH_THEME: GraphTheme = {
  series: CATEGORICAL_LIGHT,
  text: '#191c1d',
  mutedText: '#3f484a',
  grid: '#bfc8ca',
  surface: '#f6fafb',
  tooltipBackground: '#2e3132',
  tooltipText: '#eff1f2',
  fontFamily: 'Roboto, sans-serif',
  fontSize: 12
};

/** Each role: the app's `--ngx-graph-*` override, then the M3 token, then a light/dark fallback. */
const ROLES = {
  text: 'var(--ngx-graph-text, var(--mat-sys-on-surface, light-dark(#191c1d, #e1e3e3)))',
  mutedText: 'var(--ngx-graph-muted-text, var(--mat-sys-on-surface-variant, light-dark(#3f484a, #bfc8ca)))',
  grid: 'var(--ngx-graph-grid, var(--mat-sys-outline-variant, light-dark(#bfc8ca, #3f484a)))',
  surface: 'var(--ngx-graph-surface, var(--mat-sys-surface, light-dark(#f6fafb, #101415)))',
  tooltipBackground: 'var(--mat-sys-inverse-surface, light-dark(#2e3132, #e1e3e3))',
  tooltipText: 'var(--mat-sys-inverse-on-surface, light-dark(#eff1f2, #2e3132))'
} as const;

/**
 * Resolves the graph colours from the app's M3 tokens and re-resolves them whenever the colour
 * scheme or theme changes, so every graph redraws in the right mode.
 */
@Injectable({ providedIn: 'root' })
export class GraphThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeSignal = signal<GraphTheme>(FALLBACK_GRAPH_THEME);

  public readonly theme: Signal<GraphTheme> = this.themeSignal.asReadonly();

  constructor() {
    if (!this.isBrowser || typeof getComputedStyle !== 'function') {
      return;
    }

    this.resolve();

    // Re-resolve on an OS scheme change and on the app's own theme toggle (class/attribute/style on
    // <html> or <body>). Root-provided, so these live as long as the app.
    const view = this.document.defaultView;
    view?.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => this.resolve());
    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(() => this.resolve());
      const options = { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] };
      observer.observe(this.document.documentElement, options);
      if (this.document.body) {
        observer.observe(this.document.body, options);
      }
    }
  }

  private resolve(): void {
    const body = this.document.body;
    if (!body) {
      return;
    }

    // Resolve through a real `color` property: custom properties hold unresolved text (e.g.
    // `light-dark(...)`), a computed `color` is always a concrete rgb().
    const probe = this.document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;';
    body.appendChild(probe);

    const colorOf = (value: string): string => {
      probe.style.color = value;
      return getComputedStyle(probe).color;
    };

    const isDark = this.isDark(colorOf(ROLES.surface));
    const fallbackSeries = isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
    const series = fallbackSeries.map((hex, index) =>
      colorOf(`var(--ngx-graph-color-${index + 1}${index === 0 ? ', var(--app-chart-1' : ''}, ${hex})${index === 0 ? ')' : ''}`)
    );

    probe.style.color = '';
    probe.style.font = 'var(--mat-sys-body-small)';
    const style = getComputedStyle(probe);
    const fontFamily = style.fontFamily || FALLBACK_GRAPH_THEME.fontFamily;
    const fontSize = parseFloat(style.fontSize) || FALLBACK_GRAPH_THEME.fontSize;

    this.themeSignal.set({
      series,
      text: colorOf(ROLES.text),
      mutedText: colorOf(ROLES.mutedText),
      grid: colorOf(ROLES.grid),
      surface: colorOf(ROLES.surface),
      tooltipBackground: colorOf(ROLES.tooltipBackground),
      tooltipText: colorOf(ROLES.tooltipText),
      fontFamily,
      fontSize
    });

    probe.remove();
  }

  /** Dark mode is read from the resolved surface, which follows whatever mechanism the app uses. */
  private isDark(rgb: string): boolean {
    const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).map(Number);
    if ([r, g, b].some((channel) => channel === undefined || Number.isNaN(channel))) {
      return false;
    }
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
  }
}
