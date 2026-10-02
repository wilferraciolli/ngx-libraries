import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationsService, TPipe } from '@wiltech-labs/ngx-translations';
import { RelativeTimePipe } from '@wiltech-labs/ngx-dates';

@Component({
  selector: 'app-translations-demo',
  standalone: true,
  imports: [CommonModule, TPipe, RelativeTimePipe],
  templateUrl: './translations-demo.component.html',
  styleUrl: './translations-demo.component.scss',
})
export class TranslationsDemoComponent {
  protected readonly translations = inject(TranslationsService);

  protected readonly itemCount = signal(3);
  protected readonly price = 249.5;
  protected readonly now = new Date();
  protected readonly fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  protected readonly threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000);

  // A value, not a template — the id-to-key translation case, and the case for logic that needs
  // the string itself rather than a template binding.
  protected readonly statusLabel = computed(() => this.translations.t('metadata.status.active'));

  protected readonly formattedDate = computed(() =>
    this.translations.formatDate(this.now, { dateStyle: 'long' }),
  );
  protected readonly formattedPrice = computed(() =>
    this.translations.formatNumber(this.price, { style: 'currency', currency: 'GBP' }),
  );

  protected switchTo(locale: string): void {
    this.translations.setLocale(locale);
  }
}
