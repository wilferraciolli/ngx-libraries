import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, effect, inject } from '@angular/core';
import { NGX_DATES_LOCALE } from '../config/dates-locale.token';
import { RelativeTimeService } from '../services/relative-time.service';
import { InstantLike } from '../utils/relative-time.utils';

/**
 * `{{ comment.postedAt | relativeTime }}` — the template counterpart of `RelativeTimeService`.
 * Impure by design, for two independent reasons an ordinary pure pipe can't cover: the same input
 * reads differently as real time passes ("moments ago" -> "5 minutes ago"), and it re-renders on a
 * locale switch when `NGX_DATES_LOCALE` is wired to a reactive resolver (e.g. `ngx-i18n`'s
 * `I18nService.locale()`). Self-schedules its own re-check (cheaper the further away the value is
 * — a value from last year re-checks hourly, not every second) rather than relying on some other
 * binding to happen to trigger change detection.
 */
@Pipe({ name: 'relativeTime', standalone: true, pure: false })
export class RelativeTimePipe implements PipeTransform, OnDestroy {
  private readonly relativeTimeService = inject(RelativeTimeService);
  private readonly resolveLocale = inject(NGX_DATES_LOCALE);
  private readonly cdr = inject(ChangeDetectorRef);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastValue: InstantLike | null = null;
  private lastText = '';

  constructor() {
    // If `resolveLocale` reads a signal internally (e.g. wired to `I18nService.locale()`), `effect()`
    // still tracks it here despite being "just a function call" — Angular tracks any signal read
    // during the effect's synchronous execution, however many calls deep. Locale switches then
    // don't wait for the timer below.
    effect(() => {
      this.resolveLocale();
      this.cdr.markForCheck();
    });
  }

  public transform(value: InstantLike | null | undefined, options?: Intl.RelativeTimeFormatOptions): string {
    if (value === null || value === undefined) {
      return '';
    }

    this.lastValue = value;
    this.lastText = this.relativeTimeService.relativeTime(value, options);
    this.scheduleRefresh(value, options);
    return this.lastText;
  }

  public ngOnDestroy(): void {
    this.clearTimeout();
  }

  private scheduleRefresh(value: InstantLike, options?: Intl.RelativeTimeFormatOptions): void {
    this.clearTimeout();
    // Deriving the refresh delay costs another format call, which is cheap compared to a timer
    // that either never fires (delay picked too long) or fires far more often than the displayed
    // text can actually change (delay picked too short).
    const refreshMs = this.relativeTimeService.refreshDelayMs(value);
    this.timeoutId = setTimeout(() => {
      if (this.lastValue === value) {
        this.lastText = this.relativeTimeService.relativeTime(value, options);
        this.cdr.markForCheck();
        this.scheduleRefresh(value, options);
      }
    }, refreshMs);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
