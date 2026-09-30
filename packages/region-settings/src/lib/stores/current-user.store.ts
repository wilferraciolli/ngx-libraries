import { Injectable, Signal, computed, inject } from '@angular/core';
import { API_ORIGIN, ApiClientService, ILink } from '@wiltech-labs/ngx-api-client';
import { AuthStore } from '@wiltech-labs/ngx-auth';

import type { Identifiable } from '../models/identifiable.model.js';
import type { Me, UserProfile } from '../models/current-user.model.js';

/**
 * Root-provided: `/me` → its `userProfile` link → the profile, gated on `AuthStore.isSignedIn()`.
 * Both fetches are `ApiClientService.resource()`-backed, so a sign-out clears the whole chain and a
 * sign-in refetches it — no manual `ensureLoaded()`/`reset()` bookkeeping.
 *
 * Generic over `TMe`/`TProfile` in case an app's `/me`/`userProfile` payload genuinely differs from
 * the defaults (`Me`/`UserProfile`) — most apps need neither type argument.
 */
@Injectable({ providedIn: 'root' })
export class CurrentUserStore<
  TMe extends Identifiable = Me,
  TProfile extends Identifiable = UserProfile,
> {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthStore);
  private readonly apiOrigin = inject(API_ORIGIN);

  // The only hand-built URL — everything else is a link handed out from here.
  private readonly meResource = this.api.resource<'me', TMe>('me', () =>
    this.auth.isSignedIn() ? `${this.apiOrigin}/api/me` : undefined,
  );

  readonly me: Signal<TMe | undefined> = this.meResource.value;

  private readonly profileResource = this.api.resource<'userProfile', TProfile>('userProfile', () =>
    this.api.resolve(this.me()?.links?.['userProfile']),
  );

  readonly profile: Signal<TProfile | undefined> = this.profileResource.value;
  readonly loading = computed(
    () => this.meResource.isLoading() || this.profileResource.isLoading(),
  );
  readonly error = computed(() => this.meResource.error() ?? this.profileResource.error());

  /** Any link the user profile hands out, by name (`userSettings`, `notifications`, ...). Never
   *  build one of these URLs by hand — the API owns their shape and who gets to see them. */
  link(name: string): ILink | undefined {
    return this.profile()?.links?.[name];
  }
}
