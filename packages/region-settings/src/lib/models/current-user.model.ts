import type { ILink } from '@wiltech-labs/ngx-api-client';

/**
 * Default `/me` shape. `CurrentUserStore` is generic over this — pass your own type if your API's
 * `/me` payload genuinely differs, but this is the shape every consuming app is expected to match.
 */
export interface Me {
  id: string;
  name: string;
  email: string | null;
  roleIds: string[];
  links: Record<string, ILink>;
}

/**
 * Default `userProfile` shape — the navigation hub `/me` links to. `/me` only says who the caller
 * is; every feature link (`userSettings`, `systemSettings`, and whatever else an app adds) lives here.
 */
export interface UserProfile {
  id: string;
  externalId: string | null;
  name: string;
  email: string | null;
  roleIds: string[];
  links: Record<string, ILink>;
}
