import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiClientService, type ILink } from '@wiltech-labs/ngx-api-client';
import { AuthStore } from '@wiltech-labs/ngx-auth';

import type { OrgItem } from '../models/org-item.model';

/**
 * Loads the org chart from the link the app hands it (`load(link)`), gated on
 * `AuthStore.isSignedIn()` the same way `ngx-region-settings`' stores are: signed out, or no link
 * yet, means no request. Expects a collection envelope, `_data.orgNodes: OrgItem[]`.
 *
 * Feature-local: add it to the org chart page's own `providers: []`.
 */
@Injectable()
export class OrgChartStore {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthStore);

  private readonly link = signal<ILink | undefined>(undefined);
  private readonly resource = this.api.collectionResource<'orgNodes', OrgItem>('orgNodes', () =>
    this.auth.isSignedIn() ? this.api.resolve(this.link()) : undefined,
  );

  readonly items = this.resource.value;
  readonly isLoading = this.resource.isLoading;
  readonly error = computed(() => this.resource.error());

  /** Starts loading from `link` (Eg the user profile's `orgChart` link). */
  load(link: ILink | undefined): void {
    this.link.set(link);
  }

  reload(): void {
    this.resource.reload();
  }
}
