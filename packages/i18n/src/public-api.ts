// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Setup
export { provideI18n } from './lib/providers/provide-i18n';

// Config
export { NGX_I18N_CONFIG } from './lib/config/i18n-config.token';
export type { LocaleResolver, NgxI18nConfig } from './lib/config/i18n-config.token';

// Service
export { I18nService } from './lib/services/i18n.service';

// Pipe
export { TPipe } from './lib/pipes/t.pipe';

// Types for a custom `loader` (see `NgxI18nConfig.loader`) — re-exported so a consumer never
// needs to import from `@jsverse/transloco` directly.
export type { Translation, TranslocoLoader } from '@jsverse/transloco';
