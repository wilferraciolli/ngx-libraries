import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { TranslationsService } from '@wiltech-labs/ngx-translations';

/**
 * Wraps every story (see `.storybook/preview.ts`) and pushes the toolbar's `locale` global into
 * `TranslationsService`. Every locale resolver in `preview.ts` reads `TranslationsService.locale()`,
 * so one switch here reaches translations, dates, forms and the calendar alike.
 */
@Component({
  selector: 'sb-locale-sync',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocaleSync {
  private readonly translations = inject(TranslationsService);

  public readonly locale = input('en-GB');

  constructor() {
    effect(() => this.translations.setLocale(this.locale()));
  }
}
