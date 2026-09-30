import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import {
  ApiClientService,
  ApiEnvelope,
  ILink,
  MetadataService,
  ValueViewValue,
} from '@wiltech-labs/ngx-api-client';

import type { Identifiable } from '../models/identifiable.model.js';
import type { RegionSettings, RegionSettingsPayload } from '../models/region-settings.model.js';
import { CurrentUserStore } from './current-user.store.js';

/**
 * Shared by `UserSettingsStore`/`SystemSettingsStore` below: both load one settings resource by
 * following a link on the user profile, expose its `_metadata` option lists, and save/reset through
 * the resource's own `updateSettings`/`resetSettings` links. A subclass only says which `_data` key
 * and which profile link — see the two concrete stores below.
 *
 * Generic over `TSettings`/`TPayload` in case an app's settings payload genuinely differs from the
 * defaults (`RegionSettings`/`RegionSettingsPayload`) — most apps need neither type argument.
 * Feature-local (not `providedIn: 'root'`) — each page provides its own instance.
 */
export abstract class RegionSettingsStore<
  TSettings extends Identifiable = RegionSettings,
  TPayload extends object = RegionSettingsPayload,
> {
  private readonly api = inject(ApiClientService);
  private readonly metadata = inject(MetadataService);
  protected readonly currentUser = inject(CurrentUserStore);

  /** The `_data` key the API wraps the settings in (e.g. `'userSettings'`). */
  protected abstract readonly root: string;
  /** The profile link this screen follows; absent if the caller may not use it. */
  protected abstract profileLink(): ILink | undefined;

  // Never a hand-built URL: no link (profile still loading, or the caller isn't allowed) means no
  // request.
  private readonly resource = httpResource<ApiEnvelope<Record<string, TSettings>>>(() =>
    this.api.resolve(this.profileLink()),
  );

  readonly settings = computed(() => this.resource.value()?._data[this.root]);
  readonly isLoading = computed(() => this.currentUser.loading() || this.resource.isLoading());
  readonly error = computed(() => this.resource.error());

  /** The profile has loaded and handed out no link: this caller may not use this screen (e.g. a
   *  non-admin on the system settings). */
  readonly notAvailable = computed(
    () => !this.currentUser.loading() && !!this.currentUser.profile() && !this.profileLink(),
  );

  /** Allowed values straight from the API's `_metadata`, as `{value, viewValue}` — never a
   *  hardcoded list in the UI. Keyed by whatever fields the API's `_metadata` actually carries, so
   *  this works unchanged for any `TPayload` shape; label translation, if any, is the app's job. */
  readonly options = computed<Partial<Record<keyof TPayload & string, ValueViewValue[]>>>(() => {
    const metadata = this.resource.value()?._metadata;
    if (!metadata) return {};
    const result: Partial<Record<string, ValueViewValue[]>> = {};
    for (const [field, fieldMetadata] of Object.entries(metadata)) {
      if (fieldMetadata.values) {
        result[field] = this.metadata.resolveMetadataIdValues(fieldMetadata.values);
      }
    }
    return result;
  });

  async save(payload: TPayload): Promise<void> {
    const url = this.api.requireLink(
      this.settings()?.links['updateSettings'],
      'Not permitted to change these settings.',
    );
    await this.api.put<string, TSettings, TPayload>(this.root, url, payload);
    this.resource.reload();
  }

  async reset(): Promise<void> {
    const url = this.api.requireLink(
      this.settings()?.links['resetSettings'],
      'Not permitted to reset these settings.',
    );
    await this.api.delete(url);
    this.resource.reload();
  }
}

/** A caller's own settings — personal, always following their own profile's `userSettings` link. */
@Injectable()
export class UserSettingsStore extends RegionSettingsStore {
  protected readonly root = 'userSettings';

  protected profileLink(): ILink | undefined {
    return this.currentUser.link('userSettings');
  }
}

/** System-wide defaults — only handed out to callers the API considers admins (i.e. only they get
 *  a `systemSettings` link on their profile). */
@Injectable()
export class SystemSettingsStore extends RegionSettingsStore {
  protected readonly root = 'systemSettings';

  protected profileLink(): ILink | undefined {
    return this.currentUser.link('systemSettings');
  }
}
