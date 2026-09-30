import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { NGX_TRANSLATIONS_CONFIG, type NgxTranslationsConfig } from '../config/translations-config.token';
import { BundledTranslationsLoader } from './bundled-translations.loader';

/**
 * Sets up translations for the app: register once in `app.config.ts`. Wraps Transloco so the app
 * depends on `@wiltech-labs/ngx-translations` alone — inject `TranslationsService` and use the `t` pipe, never
 * Transloco's own service/pipe directly, so the engine underneath can change without touching
 * every call site.
 */
export function provideTranslations(config: NgxTranslationsConfig): EnvironmentProviders[] {
  return [
    makeEnvironmentProviders([{ provide: NGX_TRANSLATIONS_CONFIG, useValue: config }]),
    ...provideTransloco({
      config: {
        defaultLang: config.defaultLocale,
        availableLangs: config.locales,
        fallbackLang: config.defaultLocale,
        // Every app of ours re-renders on a language switch — that's the whole point of instant
        // switching. See the config's own defaults for what this flag changes.
        reRenderOnLangChange: true,
        missingHandler: { logMissingKey: true, useFallbackTranslation: true, allowEmpty: false }
      },
      loader: config.loader ?? BundledTranslationsLoader
    })
  ];
}
