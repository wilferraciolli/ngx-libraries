import { Injectable, Signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type {
  ApiEnvelope,
  ApiMessage,
  CollectionEnvelope,
  ILink,
  SingleEnvelope,
} from './envelope.js';
import { resolveLink } from './envelope.js';
import { API_ORIGIN } from './api-origin.token.js';

/** Read-only, reloadable view over an `httpResource`-backed API resource. */
export interface ApiResource<TValue> {
  readonly value: Signal<TValue>;
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<unknown>;
  /** The envelope's `_metadata` (field rules, option lists) — `{}` until a response arrives. */
  readonly metadata: Signal<NonNullable<ApiEnvelope<unknown>['_metadata']>>;
  /** The envelope's `_metaLinks` (collection-level actions, e.g. `createX`) — `{}` until a response arrives. */
  readonly metaLinks: Signal<NonNullable<ApiEnvelope<unknown>['_metaLinks']>>;
  /** The envelope's `_messages` (notices to show next to the data) — `[]` until a response arrives. */
  readonly messages: Signal<ApiMessage[]>;
  reload(): void;
}

/** A file the API sent: its bytes and the name the server suggested, if it said one. */
export interface ApiDownload {
  blob: Blob;
  /** From `Content-Disposition`; null when absent or not exposed to a cross-origin caller. */
  filename: string | null;
}

/** `attachment; filename="x.csv"` (or RFC 5987 `filename*=UTF-8''x.csv`) → `x.csv`. */
export function filenameFromDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const extended = /filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i.exec(header);
  if (extended) {
    return decodeURIComponent(extended[1].trim().replace(/^"|"$/g, ''));
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

/** HTTP methods that send a body and answer with an envelope. */
export type ApiWriteMethod = 'POST' | 'PUT' | 'PATCH';

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
    const res = await firstValueFrom(
      this.http.post<SingleEnvelope<TRoot, TResource>>(url, payload),
    );
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

  /** PATCH a partial payload and unwrap the updated resource from `_data[root]`. */
  async patch<TRoot extends string, TResource, TPayload = unknown>(
    root: TRoot,
    url: string,
    payload: TPayload,
  ): Promise<TResource> {
    const res = await firstValueFrom(
      this.http.patch<SingleEnvelope<TRoot, TResource>>(url, payload),
    );
    return res._data[root];
  }

  /** DELETE a resource. */
  async delete(url: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(url));
  }

  /**
   * Send a write and keep the whole envelope, for screens that show the
   * response's `_messages` or `_metadata` as well as the resource (e.g. a
   * clock action whose reply carries a warning). Use `post` / `put` / `patch`
   * when only `_data[root]` matters.
   */
  async send<TRoot extends string, TResource, TPayload = unknown>(
    method: ApiWriteMethod,
    url: string,
    payload?: TPayload,
  ): Promise<SingleEnvelope<TRoot, TResource>> {
    return firstValueFrom(
      this.http.request<SingleEnvelope<TRoot, TResource>>(method, url, { body: payload ?? null }),
    );
  }

  /**
   * GET a file (a CSV export, a PDF) rather than an envelope. A failed request
   * still throws an `HttpErrorResponse` whose `error` is the parsed JSON body,
   * as for every other call, so `apiErrorMessage()` reads it (a `blob`
   * request would otherwise hand back the error body as a `Blob`).
   */
  async download(url: string): Promise<ApiDownload> {
    try {
      const res = await firstValueFrom(
        this.http.get(url, { observe: 'response', responseType: 'blob' }),
      );
      return {
        blob: res.body ?? new Blob(),
        filename: filenameFromDisposition(res.headers.get('Content-Disposition')),
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error instanceof Blob) {
        const text = await error.error.text();
        let body: unknown = text;
        try {
          body = JSON.parse(text);
        } catch {
          // Not JSON (a proxy's HTML page): keep the text.
        }
        throw new HttpErrorResponse({
          error: body,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
        });
      }
      throw error;
    }
  }

  /**
   * Resolves a link to an absolute URL, or `undefined` if it's absent (e.g.
   * a prerequisite resource hasn't loaded yet, or the caller isn't
   * permitted to see it). For a read-path URL that legitimately may not be
   * there yet — use {@link requireLink} instead for a mutation that must
   * fail loudly when the link is missing.
   */
  resolve(link: ILink | undefined): string | undefined {
    return link ? resolveLink(link, this.apiOrigin) : undefined;
  }

  /**
   * Resolves a resource's action link (e.g. `provider.links.deleteProvider`)
   * to an absolute URL, or throws `message` when the caller isn't permitted
   * to perform that action — i.e. the API omitted the link.
   */
  requireLink(link: ILink | undefined, message: string): string {
    const url = this.resolve(link);
    if (!url) {
      throw new Error(message);
    }
    return url;
  }

  /**
   * Typed `httpResource` wrapper for a single-resource envelope endpoint.
   * `urlFn` returning `undefined` (e.g. while a prerequisite link hasn't
   * loaded yet) leaves the resource unfetched, matching `httpResource`.
   * `value()` is `undefined` while loading, on error, or before `urlFn`
   * resolves — it reads through `hasValue()` because a failed
   * `httpResource` throws from `value()`.
   */
  resource<TRoot extends string, TResource>(
    root: TRoot,
    urlFn: () => string | undefined,
  ): ApiResource<TResource | undefined> {
    const res = httpResource<SingleEnvelope<TRoot, TResource>>(urlFn);
    return {
      value: computed(() => (res.hasValue() ? res.value()._data[root] : undefined)),
      isLoading: res.isLoading,
      error: res.error,
      metadata: computed(() => (res.hasValue() ? (res.value()._metadata ?? {}) : {})),
      metaLinks: computed(() => (res.hasValue() ? (res.value()._metaLinks ?? {}) : {})),
      messages: computed(() => (res.hasValue() ? (res.value()._messages ?? []) : [])),
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
      value: computed(() => (res.hasValue() ? res.value()._data[root] : [])),
      isLoading: res.isLoading,
      error: res.error,
      metadata: computed(() => (res.hasValue() ? (res.value()._metadata ?? {}) : {})),
      metaLinks: computed(() => (res.hasValue() ? (res.value()._metaLinks ?? {}) : {})),
      messages: computed(() => (res.hasValue() ? (res.value()._messages ?? []) : [])),
      reload: () => res.reload(),
    };
  }
}
