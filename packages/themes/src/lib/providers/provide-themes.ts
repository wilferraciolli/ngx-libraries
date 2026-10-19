import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { NGX_THEMES_CONFIG, ThemesConfig } from '../config/themes-config.model.js';
import { ThemeService } from '../services/theme.service.js';

/**
 * Registers the app's palette families and eagerly constructs `ThemeService` at startup (same
 * `provideAppInitializer` sequencing as `ngx-notifications`' `provideNotifications()`), so the
 * stored choice is applied even on a route that never renders `<ngx-theme-switcher>`.
 */
export function provideThemes(config: ThemesConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NGX_THEMES_CONFIG, useValue: config },
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ]);
}
