import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { TranslationsService } from '../services/translations.service';

/**
 * `{{ 'flight.departure' | t }}` — the template counterpart of `TranslationsService.t()`. Impure by
 * design: it subscribes to a language-change notification itself and calls `markForCheck()` — the
 * same subscribe-and-mark mechanism Transloco's own pipe uses — so it stays live across a language
 * switch under `OnPush`, without the template needing to read a signal or an `Observable` itself.
 * The actual value comes from `TranslationsService.t()`, never `TranslocoService` directly, so the pipe
 * and the service always agree on what "current locale" means; `langChanges$` here is only the
 * notification that something may have changed, not the source of the translated value.
 */
@Pipe({ name: 't', standalone: true, pure: false })
export class TPipe implements PipeTransform, OnDestroy {
  private readonly translations = inject(TranslationsService);
  private readonly transloco = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);

  private subscription: Subscription | null = null;
  private lastKey?: string;
  private lastValue = '';

  public transform(key: string, params?: Record<string, string | number>): string {
    if (!key) {
      return key;
    }

    const cacheKey = params ? `${key}${JSON.stringify(params)}` : key;
    if (cacheKey === this.lastKey) {
      return this.lastValue;
    }
    this.lastKey = cacheKey;

    this.subscription?.unsubscribe();
    this.subscription = this.transloco.langChanges$.subscribe(() => {
      this.lastValue = this.translations.t(key, params);
      this.cdr.markForCheck();
    });

    this.lastValue = this.translations.t(key, params);
    return this.lastValue;
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
