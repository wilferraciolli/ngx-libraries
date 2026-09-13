/**
 * A single field-level validation violation, as returned in `ApiErrorResponse.fieldErrors`
 * (mirrors `ApiError.FieldViolation` on the backend).
 */
export interface ApiFieldViolation {
  field: string;
  fieldValue: unknown;
  message: string;
}

/**
 * Single JSON error shape returned by a Wiltech API for every handled exception
 * (mirrors `ApiError` produced by the backend's global exception handler).
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: ApiFieldViolation[];
}

/** Maps `fieldErrors` to a `{ field: message }` record for quick form-control lookup. */
export function fieldErrorsByField(response: ApiErrorResponse): Record<string, string> {
  const result: Record<string, string> = {};
  for (const violation of response.fieldErrors) {
    result[violation.field] = violation.message;
  }
  return result;
}

/**
 * Human-readable summary of an API error: the top-level `message` when there are no
 * field violations, otherwise each violation rendered as `field: message`.
 */
export function summarizeApiError(response: ApiErrorResponse): string {
  if (response.fieldErrors.length === 0) {
    return response.message;
  }
  return response.fieldErrors.map((violation) => `${violation.field}: ${violation.message}`).join('; ');
}
