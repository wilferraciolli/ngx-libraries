# @wiltech-labs/ngx-api-client

Angular library for talking to a Wiltech backend's HTTP API: the response
envelope shape, HATEOAS-style links, field metadata, error shapes, and the
services/pipe built on top of them. See root `../../CLAUDE.md` for
repo-wide conventions.

Ported from `insurly-ui` (`../insurly/insurly-ui` relative to this repo's
parent) — that app's `core/api/api-envelope.ts`, `_services/link.service.ts`,
`_services/metadata.service.ts`, `_helpers/convert-id-to-value.pipe.ts`, and
`shared/response/*` are where this package's logic originally lived. The
`wiltech-labs-*` Python packages (`py-libraries`: `wiltech_labs_rest`'s envelope,
`wiltech_labs_core`'s `register_error_handlers`, plus FastAPI's own `422` body) are the
source of truth `envelope.ts` and `error.ts` mirror. If they change, this package needs
updating to match — not the other way around, unless the change originates here
deliberately (e.g. the `ApiClientService` addition).

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    ├── http-client/      # envelope/error contracts + the client that consumes them
    │   ├── envelope.ts           # ApiEnvelope, ILink, SingleEnvelope, CollectionEnvelope, resolveLink()
    │   ├── error.ts               # ApiErrorResponse, ApiFieldViolation, fieldErrorsByField(), summarizeApiError(), apiErrorMessage()
    │   ├── api-origin.token.ts    # API_ORIGIN InjectionToken — consuming app provides its own origin
    │   ├── api-client.service.ts  # ApiClientService: get/post/put/patch/delete/send/download, requireLink(), resource()/collectionResource()
    │   └── save-download.ts       # saveDownload(): hand a downloaded file to the browser
    ├── links/
    │   └── link.service.ts        # LinkService: hasLink / isTemplateLink / getCreateUrlFromTemplateUrl
    └── metadata/
        ├── value-types.ts         # Id, IdValue, ValueViewValue
        ├── metadata.service.ts    # MetadataService: resolveMetadataIdValues / resolveMetadataIds
        └── convert-id-to-value.pipe.ts  # ConvertIdToStringValuePipe ('convertIdToValues')
```

## Conventions

- Real Angular constructs (`@Injectable`, `@Pipe`) — not framework-agnostic
  functions. Every known consumer is Angular, so idiomatic DI beats a
  generic-TS compromise (see root `CLAUDE.md`'s "Consumers" decision).
- One folder per concern under `src/lib/` — don't let it go flat again. A
  new concern (e.g. auth headers, pagination) gets its own folder, not a
  file dropped next to `http-client/`.
- `ApiClientService` owns HTTP mechanics only — GET/POST/PUT/PATCH/DELETE +
  envelope unwrap + link-follow guard. It does **not** own URL construction
  or "reload the list after a mutation" — that orchestration stays in each
  feature's own `*ApiService` in the consuming app, per `insurly-ui`'s
  locked-in "one typed `*ApiService` per feature" decision
  (`insurly-ui/CLAUDE.md`). This package standardizes the repeated
  mechanics, not the per-feature architecture.
- `resolveLink()` / `ApiClientService` need the API's bare origin (not the
  `/api`-prefixed base URL) — provided via `API_ORIGIN`, never imported
  from an `environment.ts` directly the way `insurly-ui`'s original code
  did (this package can't depend on any one consumer's environment file).
  `API_ORIGIN` defaults to `''` (same-origin), so only cross-origin
  deployments (frontend and backend on different domains, like
  `insurly-ui` on Cloudflare Pages + `insurly-api` on Render) need to
  provide it — same-origin consumers need zero config.
- `ApiErrorResponse` / `ApiFieldViolation` mirror the FastAPI error body:
  `{"detail": "…"}` from `wiltech_labs_core`'s `AppError` handler, or
  `{"detail": [{loc, msg, type}]}` for a `422`. Wiltech backends are FastAPI only
  (no Spring), so there is no other shape to support.

## Status

- Published to npm as `@wiltech-labs/ngx-api-client` — see the note in the
  root `CLAUDE.md` on why the scope is `@wiltech-labs`, not `@wiltech`.
- Wired into `insurly-ui`: every `*ApiService`
  (`ProviderApiService`/`AdminApiService`/`AccountApiService`/
  `AdminProfileApiService`/`SystemSettingsService`/`UserSettingsService`/
  `CarQuoteApiService`) now injects `ApiClientService` instead of
  hand-rolling `HttpClient` calls, and all the locally-duplicated files
  (`core/api/api-envelope.ts`, `_services/link.service.ts`,
  `_services/metadata.service.ts`, `_helpers/convert-id-to-value.pipe.ts`,
  `shared/response/*`) are deleted from that repo. `insurly-ui/CLAUDE.md`
  and `docs/02-architecture.md` (in the `insurly` repo) describe this
  pattern now.
- No other consumer yet — the two other Angular projects that motivated
  this package don't exist yet.
