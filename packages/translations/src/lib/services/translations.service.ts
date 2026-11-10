import {
  Injectable,
  Injector,
  Signal,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { NGX_TRANSLATIONS_CONFIG, type TranslationArea } from '../config/translations-config.token';

/**
 * App-wide translation and locale state (like `AuthStore`/`CurrentUserStore` — inject it anywhere).
 * Switching language is instant: nothing here reloads the app, and every `t()`/format call reads
 * the current locale fresh, so a switch shows up the moment `locale()` changes.
 */
@Injectable({ providedIn: 'root' })
export class TranslationsService {
  private readonly transloco = inject(TranslocoService);
  private readonly config = inject(NGX_TRANSLATIONS_CONFIG);
  // `resolveLocale`/`persistLocale` run in this injector's context, so an app can `inject()` its
  // own stores inside them straight from `provideTranslations()`'s plain config object.
  private readonly injector = inject(Injector);

  /** This session's explicit choice, if `setLocale()` has been called; `null` until then. */
  private readonly sessionOverride = signal<string | null>(null);

  /**
   * Bumped whenever strings arrive (a lazy locale, an area). `t()` reads it, so a `computed()` that
   * ran before they arrived runs again instead of keeping the fallback text or the bare key.
   */
  private readonly revision = signal(0);

  /** Every area opened this session: a language switch loads each one in the new locale. */
  private readonly areas = new Set<TranslationArea>();
  /** One load per area and locale; a failed one is forgotten, so the next visit tries again. */
  private readonly areaLoads = new Map<TranslationArea, Map<string, Promise<void>>>();

  /**
   * Resolution order: this session's override, then the app's `resolveLocale`, then
   * `defaultLocale`. Reactive — the app's resolver reading its own signals (e.g. a profile that
   * loads after sign-in) flows through automatically, not just at startup.
   */
  public readonly locale: Signal<string> = computed(
    () =>
      this.sessionOverride() ??
      runInInjectionContext(this.injector, () => this.config.resolveLocale?.()) ??
      this.config.defaultLocale,
  );

  constructor() {
    // Keeps Transloco's own active language following `locale()` for any change `setLocale()`
    // didn't cause directly — a resolver settling asynchronously, for instance. A plain RxJS
    // subscription rather than `effect()`, so pushing into Transloco (which owns its own signal)
    // isn't a write-inside-an-effect concern.
    toObservable(this.locale)
      .pipe(takeUntilDestroyed())
      .subscribe((locale) => this.activate(locale));
  }

  /**
   * Switches language for this session, immediately — no reload, and nothing here awaits the
   * persist below. Every `t()` call, the `t` pipe, and `formatDate()`/`formatNumber()` reflect it
   * on the very next read.
   */
  public setLocale(locale: string): void {
    this.sessionOverride.set(locale);
    this.activate(locale);
    runInInjectionContext(this.injector, () => this.config.persistLocale?.(locale));
  }

  /**
   * Loads `locale`'s translations, then makes it active. `TranslocoService.setActiveLang()` on its
   * own doesn't load anything — that's ordinarily a pipe/directive's job, and `t()`/`TPipe` read
   * `translate()` directly instead, so this is where loading has to happen. `load()` caches by
   * locale, so calling it again (every `locale()` recomputation, every `setLocale()`) is cheap.
   * With the bundled default loader this resolves synchronously; a real network `loader` means a
   * brief window where a not-yet-loaded locale's keys render as themselves until it resolves.
   */
  private activate(locale: string): void {
    const areas = [...this.areas].map((area) => this.loadAreaIn(area, locale));
    this.transloco.load(locale).subscribe(() => {
      void Promise.all(areas).then(() => {
        // A quicker switch since may have moved on; activating this one would undo it.
        if (this.locale() !== locale) {
          return;
        }
        if (this.transloco.getActiveLang() !== locale) {
          this.transloco.setActiveLang(locale);
        }
        this.revision.update((n) => n + 1);
      });
    });
  }

  /**
   * Loads `area`'s strings for the current locale, and from then on for any locale switched to.
   * What `translationArea()` calls from a route; call it directly only for strings needed outside
   * a route (a dialog opened from another area, say). Never rejects: strings that can't load
   * (offline) are logged and leave their keys showing, rather than blocking the page.
   */
  public loadArea(area: TranslationArea): Promise<void> {
    this.areas.add(area);
    return this.loadAreaIn(area, this.locale());
  }

  private loadAreaIn(area: TranslationArea, locale: string): Promise<void> {
    let byLocale = this.areaLoads.get(area);
    if (!byLocale) {
      byLocale = new Map<string, Promise<void>>();
      this.areaLoads.set(area, byLocale);
    }
    const started = byLocale.get(locale);
    if (started) {
      return started;
    }
    const dictionary = area[locale];
    if (!dictionary) {
      return Promise.resolve();
    }
    const loads = byLocale;
    const loading = Promise.all([dictionary(), firstValueFrom(this.transloco.load(locale))]).then(
      ([translation]) => {
        // Merged once the locale's own dictionary is in, so the area joins it, not the reverse.
        this.transloco.setTranslation(translation, locale, {
          merge: true,
          emitChange: this.transloco.getActiveLang() === locale,
        });
        this.revision.update((n) => n + 1);
      },
      (error: unknown) => {
        loads.delete(locale);
        console.error(`Translations for ${locale} could not load: their keys show instead.`, error);
      },
    );
    loads.set(locale, loading);
    return loading;
  }

  /**
   * The instant translated value of `key` — for logic (a `computed()`, a toast message, an id
   * worked out to a key at runtime). Use the `t` pipe instead in a template, which stays live
   * across a language switch without needing to be an `Observable`/`Signal` itself.
   *
   * Passes `locale()` explicitly rather than relying on Transloco's own active language: reading
   * our own signal here is what lets a `computed()` wrapping this call know to re-run on a switch
   * — `TranslocoService.translate()` alone reads plain internal state, not a signal, so nothing
   * would tell `computed()` this call has anything to recompute.
   */
  public t(key: string, params?: Record<string, string | number>): string {
    this.revision();
    return this.transloco.translate(key, params, this.locale());
  }

  /** Formats a date/instant in the current locale — reads `locale()`, so it updates on a switch. */
  public formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat(this.locale(), options).format(date);
  }

  /** Formats a number in the current locale — reads `locale()`, so it updates on a switch. */
  public formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale(), options).format(value);
  }

  /** Every locale the app supports, for a language switcher. */
  public supportedLocales(): string[] {
    return this.config.locales;
  }
}
