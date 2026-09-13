import { Injectable, Signal, computed, inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { CollectionEnvelope, ILink, SingleEnvelope } from './envelope.js';
import { resolveLink } from './envelope.js';
import { API_ORIGIN } from './api-origin.token.js';

/** Read-only, reloadable view over an `httpResource`-backed API resource. */
export interface ApiResource<TValue> {
  readonly value: Signal<TValue>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<unknown>;
  reload(): void;
}

/**
 * Shared typed boundary for the GET/POST/PUT/DELETE + envelope-unwrap +
 * HATEOAS-link-follow pattern every feature API service was hand-rolling.
 *
 * Each feature keeps its own typed `*ApiService` (still the documented
 * per-feature-service convention) — it just delegates the HTTP mechanics
 * to this client instead of repeating `firstValueFrom(this.http.x(...))` +
 * `_data[root]` unwrapping in every method.
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(API_ORIGIN);

  /** GET a single resource and unwrap it from `_data[root]`. */
  async get<TRoot extends string, TResource>(root: TRoot, url: string): Promise<TResource> {
    const res = await firstValueFrom(this.http.get<SingleEnvelope<TRoot, TResource>>(url));
    return res._data[root];
  }

  /** POST a payload and unwrap the created resource from `_data[root]`. */
  async post<TRoot extends string, TResource, TPayload = unknown>(
    root: TRoot,
    url: string,
    payload: TPayload,
  ): Promise<TResource> {
    const res = await firstValueFrom(this.http.post<SingleEnvelope<TRoot, TResource>>(url, payload));
    return res._data[root];
  }

  /** PUT a payload and unwrap the updated resource from `_data[root]`. */
  async put<TRoot extends string, TResource, TPayload = unknown>(
    root: TRoot,
    url: string,
    payload: TPayload,
  ): Promise<TResource> {
    const res = await firstValueFrom(this.http.put<SingleEnvelope<TRoot, TResource>>(url, payload));
    return res._data[root];
  }

  /** DELETE a resource. */
  async delete(url: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(url));
  }

  /**
   * Resolves a resource's action link (e.g. `provider.links.deleteProvider`)
   * to an absolute URL, or throws `message` when the caller isn't permitted
   * to perform that action — i.e. the API omitted the link.
   */
  requireLink(link: ILink | undefined, message: string): string {
    if (!link) {
      throw new Error(message);
    }
    return resolveLink(link, this.apiOrigin);
  }

  /**
   * Typed `httpResource` wrapper for a single-resource envelope endpoint.
   * `urlFn` returning `undefined` (e.g. while a prerequisite link hasn't
   * loaded yet) leaves the resource unfetched, matching `httpResource`.
   */
  resource<TRoot extends string, TResource>(
    root: TRoot,
    urlFn: () => string | undefined,
  ): ApiResource<TResource | undefined> {
    const res = httpResource<SingleEnvelope<TRoot, TResource>>(urlFn);
    return {
      value: computed(() => res.value()?._data[root]),
      isLoading: res.isLoading,
      error: res.error,
      reload: () => res.reload(),
    };
  }

  /**
   * Typed `httpResource` wrapper for a collection envelope endpoint —
   * `value()` is `[]` while loading, on error, or before `urlFn` resolves.
   */
  collectionResource<TRoot extends string, TResource>(
    root: TRoot,
    urlFn: () => string | undefined,
  ): ApiResource<TResource[]> {
    const res = httpResource<CollectionEnvelope<TRoot, TResource>>(urlFn);
    return {
      value: computed(() => res.value()?._data[root] ?? []),
      isLoading: res.isLoading,
      error: res.error,
      reload: () => res.reload(),
    };
  }
}
