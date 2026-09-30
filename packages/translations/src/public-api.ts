// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Setup
export { provideTranslations } from './lib/providers/provide-translations';

// Config
export { NGX_TRANSLATIONS_CONFIG } from './lib/config/translations-config.token';
export type { LocaleResolver, NgxTranslationsConfig } from './lib/config/translations-config.token';

// Service
export { TranslationsService } from './lib/services/translations.service';

// Pipe
export { TPipe } from './lib/pipes/t.pipe';

// Types for a custom `loader` (see `NgxTranslationsConfig.loader`) — re-exported so a consumer never
// needs to import from `@jsverse/transloco` directly.
export type { Translation, TranslocoLoader } from '@jsverse/transloco';
