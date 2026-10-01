import { InjectionToken } from '@angular/core';

export interface RegionSettingsFormText {
  save: string;
  saving: string;
  timezoneLabel: string;
  languageLabel: string;
  localeLabel: string;
  currencyLabel: string;
  themeLabel: string;
}

export const DEFAULT_REGION_SETTINGS_FORM_TEXT: RegionSettingsFormText = {
  save: 'Save',
  saving: 'Saving…',
  timezoneLabel: 'Timezone',
  languageLabel: 'Language',
  localeLabel: 'Locale',
  currencyLabel: 'Currency',
  themeLabel: 'Theme',
};

/**
 * Same resolver-function pattern as `ngx-notifications`' `NGX_NOTIFICATIONS_TEXT` / `ngx-graphs`'
 * `NGX_GRAPHS_TEXT` — override it (e.g. wired to `ngx-translations`) to translate it; leave it
 * unset and it stays English. Kept separate from a direct `@jsverse/transloco` dependency, per this
 * package's existing "no dependency on `ngx-translations`" decision (see `CLAUDE.md`).
 */
export const NGX_REGION_SETTINGS_FORM_TEXT = new InjectionToken<() => RegionSettingsFormText>(
  'NGX_REGION_SETTINGS_FORM_TEXT',
  { providedIn: 'root', factory: () => () => DEFAULT_REGION_SETTINGS_FORM_TEXT },
);
