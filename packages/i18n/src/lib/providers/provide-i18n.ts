import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { NGX_I18N_CONFIG, type NgxI18nConfig } from '../config/i18n-config.token';
import { BundledI18nLoader } from './bundled-i18n.loader';

/**
 * Sets up translations for the app: register once in `app.config.ts`. Wraps Transloco so the app
 * depends on `@wiltech-labs/ngx-i18n` alone — inject `I18nService` and use the `t` pipe, never
 * Transloco's own service/pipe directly, so the engine underneath can change without touching
 * every call site.
 */
export function provideI18n(config: NgxI18nConfig): EnvironmentProviders[] {
  return [
    makeEnvironmentProviders([{ provide: NGX_I18N_CONFIG, useValue: config }]),
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
      loader: config.loader ?? BundledI18nLoader
    })
  ];
}
