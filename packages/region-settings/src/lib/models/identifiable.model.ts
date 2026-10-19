import type { ILink } from '@wiltech-labs/ngx-api-client';

/** The minimal shape every resource in this package's generics is assumed to have. */
export interface Identifiable {
  id: string;
  links: Record<string, ILink>;
}
