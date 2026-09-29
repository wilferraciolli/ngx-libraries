import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, TPipe } from '@wiltech-labs/ngx-i18n';

@Component({
  selector: 'app-i18n-demo',
  standalone: true,
  imports: [CommonModule, TPipe],
  templateUrl: './i18n-demo.component.html',
  styleUrls: ['./i18n-demo.component.css']
})
export class I18nDemoComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly itemCount = signal(3);
  protected readonly price = 249.5;
  protected readonly now = new Date();

  // A value, not a template — the id-to-key translation case, and the case for logic that needs
  // the string itself rather than a template binding.
  protected readonly statusLabel = computed(() => this.i18n.t('metadata.status.active'));

  protected readonly formattedDate = computed(() => this.i18n.formatDate(this.now, { dateStyle: 'long' }));
  protected readonly formattedPrice = computed(() =>
    this.i18n.formatNumber(this.price, { style: 'currency', currency: 'GBP' })
  );

  protected switchTo(locale: string): void {
    this.i18n.setLocale(locale);
  }
}
