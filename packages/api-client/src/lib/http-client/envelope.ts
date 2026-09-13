/**
 * Shape of every response from a Wiltech API.
 *
 * The backend wraps payloads in a HAL-ish envelope: the resource (or list of
 * resources) sits under `_data` keyed by the DTO's JSON root name
 * (e.g. `provider`), with sidecar `_metadata` / `_metaLinks` / `_messages`.
 */
export interface ApiEnvelope<TData> {
  _data: TData;
  _metadata?: Record<string, ApiFieldMetadata>;
  _metaLinks?: Record<string, ILink>;
  _messages?: unknown;
}

export interface ApiFieldMetadata {
  readOnly?: boolean;
  hidden?: boolean;
  mandatory?: boolean;
  values?: Array<{ id: string; value: string }>;
}

/**
 * A single HATEOAS-style link the API hands back — either alongside the
 * envelope (`_metaLinks`, e.g. the collection's own `self`) or nested inside
 * a resource under its `links` property (e.g. `deleteProvider`). A resource
 * action link is only present when the caller is allowed to perform it, so
 * its absence is how the UI knows to hide that action rather than a
 * separate permissions check.
 */
export interface ILink {
  href: string;
}

/**
 * Resolves a link the API returned (e.g. `provider.links.deleteProvider`) to
 * an absolute, callable URL. `href` already includes the API prefix (e.g.
 * `/api`), so this needs the bare origin, not the app's base API URL.
 */
export function resolveLink(link: ILink, apiOrigin: string): string {
  return apiOrigin + link.href;
}

/** Envelope carrying a single resource under `_data[rootName]`. */
export type SingleEnvelope<TRoot extends string, TResource> = ApiEnvelope<Record<TRoot, TResource>>;

/** Envelope carrying a resource collection under `_data[rootName]`. */
export type CollectionEnvelope<TRoot extends string, TResource> = ApiEnvelope<
  Record<TRoot, TResource[]>
>;
