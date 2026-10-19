import { HttpErrorResponse } from '@angular/common/http';

/**
 * One entry of a `422` body's `detail` list: FastAPI's request-validation error (from Pydantic).
 */
export interface ApiFieldViolation {
  /** Where the bad value is, e.g. `['body', 'email']`. */
  loc: Array<string | number>;
  msg: string;
  type?: string;
}

/**
 * The error body of a Wiltech API (FastAPI): a fixed message for a business rule, from
 * `wiltech_labs_core`'s `AppError` handler (`{"detail": "Todo not found"}`), or FastAPI's list of
 * validation violations for a `422`.
 */
export interface ApiErrorResponse {
  detail: string | ApiFieldViolation[];
}

const LOCATION_ROOTS = new Set(['body', 'query', 'path', 'header', 'cookie']);

/** `['body', 'address', 'city']` → `'address.city'`; a model-level error (`['body']`) → `''`. */
function violationField(violation: ApiFieldViolation): string {
  return violation.loc
    .filter((part, index) => !(index === 0 && LOCATION_ROOTS.has(String(part))))
    .join('.');
}

/** Pydantic prefixes a validator's own message with "Value error, "; the rest is the message. */
function violationMessage(violation: ApiFieldViolation): string {
  return violation.msg.replace(/^Value error, /, '');
}

/**
 * Maps a `422`'s violations to a `{ field: message }` record for quick form-control lookup
 * (nested fields joined with dots, e.g. `address.city`). A plain `detail` message has no fields,
 * so it maps to `{}`.
 */
export function fieldErrorsByField(response: ApiErrorResponse): Record<string, string> {
  const result: Record<string, string> = {};
  if (Array.isArray(response.detail)) {
    for (const violation of response.detail) {
      const field = violationField(violation);
      if (field) {
        result[field] = violationMessage(violation);
      }
    }
  }
  return result;
}

/**
 * Human-readable summary of an API error: the `detail` message, or each violation rendered as
 * `field: message` (just `message` for a model-level one).
 */
export function summarizeApiError(response: ApiErrorResponse): string {
  if (!Array.isArray(response.detail)) {
    return response.detail;
  }
  return response.detail
    .map((violation) => {
      const field = violationField(violation);
      const message = violationMessage(violation);
      return field ? `${field}: ${message}` : message;
    })
    .join('; ');
}

function isApiErrorBody(body: unknown): body is ApiErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    (typeof body.detail === 'string' || Array.isArray(body.detail))
  );
}

/**
 * The API's own words for a failed request, ready for an error banner: `summarizeApiError()` of
 * the body when the server answered with a Wiltech error. `null` for anything else — the request
 * never reached the server (status 0), or the body isn't one the API produced (a proxy's HTML
 * page) — so the caller shows its own "couldn't reach the server" text instead.
 */
export function apiErrorMessage(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse) || error.status === 0) {
    return null;
  }
  return isApiErrorBody(error.error) ? summarizeApiError(error.error) : null;
}
