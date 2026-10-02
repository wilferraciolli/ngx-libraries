import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TPipe, TranslationsService } from '@wiltech-labs/ngx-translations';

/** Reads the locale from `TranslationsService.locale()` directly, which the preview's `locale`
 *  toolbar global drives (see `.storybook/preview.ts` / `src/support/locale-sync.ts`) — there is
 *  no separate language switcher in this story, unlike the showcase app's own demo. */
@Component({
  selector: 'sb-translations-demo-host',
  standalone: true,
  imports: [TPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack">
      <p class="Story-note">
        {{ 'story.currentLocale' | t }}: <strong>{{ translations.locale() }}</strong> — switch the
        <strong>Locale</strong> toolbar global above to see every line below update.
      </p>

      <div>
        <h4>t pipe</h4>
        <p>{{ 'story.greeting' | t: { name: 'Ada' } }}</p>
        <p>{{ 'story.itemCount' | t: { count: itemCount() } }}</p>
        <p>{{ 'common.buttons.save' | t }} / {{ 'common.buttons.cancel' | t }}</p>
      </div>

      <div>
        <h4>TranslationsService.t() (logic, not a template)</h4>
        <p>
          metadata.status.active → <strong>{{ statusLabel() }}</strong>
        </p>
      </div>

      <div>
        <h4>formatDate() / formatNumber()</h4>
        <p>
          {{ 'story.formattedDate' | t }}: <strong>{{ formattedDate() }}</strong>
        </p>
        <p>
          {{ 'story.formattedNumber' | t }}: <strong>{{ formattedPrice() }}</strong>
        </p>
      </div>

      <div>
        <h4>A key with no translation</h4>
        <p class="Story-note">
          {{ 'story.missingKeyNote' | t }}: <code>{{ 'does.not.exist' | t }}</code>
        </p>
      </div>
    </div>
  `,
})
export class TranslationsDemoHost {
  protected readonly translations = inject(TranslationsService);
  protected readonly itemCount = signal(3);
  private readonly price = 249.5;
  private readonly now = new Date('2026-12-31T18:05:00Z');

  protected readonly statusLabel = computed(() => this.translations.t('metadata.status.active'));
  protected readonly formattedDate = computed(() =>
    this.translations.formatDate(this.now, { dateStyle: 'long', timeStyle: 'short' }),
  );
  protected readonly formattedPrice = computed(() =>
    this.translations.formatNumber(this.price, { style: 'currency', currency: 'GBP' }),
  );
}
