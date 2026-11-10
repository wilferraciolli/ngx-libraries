import type { ILink } from '@wiltech-labs/ngx-api-client';

/**
 * Default settings shape — the same one for a user's own settings and the system defaults, just
 * mounted behind different profile links. `RegionSettingsStore` is generic over this — pass your own
 * `TSettings`/`TPayload` if your API's settings payload genuinely differs, but this is the shape
 * every consuming app is expected to match.
 */
export interface RegionSettings {
  id: string;
  /** Only present on a user's own settings: `'SYSTEM'` while still falling back to the system
   *  default, `'USER'` once they've saved their own. Absent on the system defaults themselves. */
  owner_type?: 'SYSTEM' | 'USER';
  timezone: string;
  language: string;
  locale: string;
  currency: string;
  theme: string;
  links: Record<string, ILink>;
}

export type RegionSettingsPayload = Pick<
  RegionSettings,
  'timezone' | 'language' | 'locale' | 'currency' | 'theme'
>;
