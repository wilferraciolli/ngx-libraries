# @wiltech-labs/ngx-api-client

Shared Angular client for Wiltech HTTP APIs: `ApiClientService`
(GET/POST/PUT/PATCH/DELETE + envelope-unwrap), the response envelope, HATEOAS-style
links, field metadata shapes, and the error body returned by a Wiltech
backend (FastAPI on the `wiltech-labs-*` Python packages: `wiltech_labs_rest`'s
`ApiResponse` envelope, `wiltech_labs_core`'s `{"detail": …}` errors) — plus the
`LinkService`/`MetadataService` and `convertIdToValues` pipe built on them.

Built as a real Angular library (Angular Package Format, via `ng-packagr`),
so it links into a consuming Angular app the same way `@angular/*` packages
do. Requires `@angular/core`/`@angular/common`/`rxjs` as peer dependencies.

### Sample payload

```json

{
	"_data": {
		"userProfile": {
			"id": "uuidAsIds",
			"name": "Jon Doe",
			"roleIds": [
				"SDTANDARD",
				"ADMIN"
			],
			"links" : {
				"self": {
					"href": "/api/users/uuidsIds"
				},
				"updateUser": {
					"href": "/api/users/uuidsIds"
				},
				"deleteUser": {
					"href": "/api/users/uuidsIds"
				}
			}
		}
	},
	"_metadata" :{
	  "id": {
            "readOnly": true,
            "hidden": true
        },
		"name": {
            "mandatory": true
        },
		"roleIds": {
            "mandatory": true,
            "values" : [
				{
					"id": "ADMIN",
					"value": "System Administrator"
				},
				{
					"id": "SDTANDARD",
					"value": "Standard user"
				}
			]
        }
	},
	"_metaLinks": {
		"createUser": {
			href": "/api/users/template"
		}
	},
	"_messages": [
		{
			"type": "INFO",
			"value": "You cannot remove your own Admin role..."
		}
	]
}
```

## Install

```bash
npm install @wiltech-labs/ngx-api-client
```

`API_ORIGIN` defaults to `''` (same-origin — links resolve as relative
URLs), so nothing to configure if your frontend and backend share an
origin. Only provide it if they're on different origins, in
`app.config.ts` (or equivalent):

```ts
import { API_ORIGIN } from '@wiltech-labs/ngx-api-client';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: API_ORIGIN, useValue: environment.apiOrigin },
  ],
};
```

## Usage

`ApiClientService` is the shared GET/POST/PUT/PATCH/DELETE + envelope-unwrap
client — each feature still gets its own typed `*ApiService`, but it
delegates the HTTP mechanics to this instead of hand-rolling
`firstValueFrom(this.http.x(...))` + `_data[root]` unwrapping per method:

```ts
import { ApiClientService, ApiResource } from '@wiltech-labs/ngx-api-client';

@Injectable({ providedIn: 'root' })
export class ProviderApiService {
  private readonly api = inject(ApiClientService);
  private readonly collectionUrl = computed(() => /* ... */);

  readonly listResource: ApiResource<Provider[]> = this.api.collectionResource(
    'provider',
    () => this.collectionUrl(),
  );

  async create(payload: ProviderPayload): Promise<Provider> {
    const provider = await this.api.post('provider', this.collectionUrl()!, payload);
    this.listResource.reload();
    return provider;
  }

  async update(provider: Provider, payload: ProviderPayload): Promise<Provider> {
    const url = this.api.requireLink(
      provider.links.updateProvider,
      `Not permitted to update provider ${provider.id}`,
    );
    const updated = await this.api.put('provider', url, payload);
    this.listResource.reload();
    return updated;
  }

  async remove(provider: Provider): Promise<void> {
    const url = this.api.requireLink(
      provider.links.deleteProvider,
      `Not permitted to delete provider ${provider.id}`,
    );
    await this.api.delete(url);
    this.listResource.reload();
  }
}
```

`resource()` is the single-resource counterpart of `collectionResource()`
(e.g. a dashboard, or "me") — same shape, `value()` unwraps `_data[root]`
instead of `_data[root][]`.

Both also expose the envelope's sidecars as signals — `metadata()` (`_metadata`, e.g. a select's
option list) and `metaLinks()` (`_metaLinks`, e.g. the collection's `createX` action) — each `{}`
until a response arrives:

```ts
readonly statusOptions = computed(() =>
  this.meta.resolveMetadataIdValues(this.listResource.metadata()['status']?.values ?? []),
);
```

`messages()` is the envelope's `_messages` as typed `ApiMessage[]` (`{ type: 'INFO' | 'WARNING' |
'ERROR' | 'SUCCESS', value }`), `[]` until a response arrives — notices the server wants shown next
to the data, such as a forgotten clock-out:

```ts
readonly warnings = computed(() => this.clockResource.messages().filter((m) => m.type === 'WARNING'));
```

When a write's reply carries messages or metadata the screen needs, `send()` keeps the whole
envelope instead of unwrapping `_data[root]`:

```ts
const envelope = await this.api.send<'timeClock', TimeClock>('POST', url);
this.messages.set(envelope._messages ?? []);
```

```ts
import { ApiEnvelope, SingleEnvelope, CollectionEnvelope, ILink, LinkService } from '@wiltech-labs/ngx-api-client';

type ProviderEnvelope = SingleEnvelope<'provider', Provider>;

constructor(private links: LinkService) {}

canDelete(provider: Provider): boolean {
  return this.links.hasLink(provider.links?.deleteProvider);
}
```

### Files

`download(url)` (from 1.0.4) GETs a file instead of an envelope — a CSV export, a PDF — and
returns `{ blob, filename }`, the name taken from `Content-Disposition` when the server sends one
(a cross-origin API must list it in `Access-Control-Expose-Headers`, or `filename` is `null`).
`saveDownload(download, fallbackName)` then hands it to the browser; call it from the click that
asked for the file. A failed download throws the same `HttpErrorResponse` as any other call, with
the JSON error body parsed, so `apiErrorMessage()` works on it.

```ts
import { ApiClientService, apiErrorMessage, saveDownload } from '@wiltech-labs/ngx-api-client';

async exportHours(link: ILink): Promise<void> {
  try {
    saveDownload(await this.api.download(this.api.requireLink(link, 'No export')), 'hours.csv');
  } catch (error) {
    this.error.set(apiErrorMessage(error) ?? this.translations.t('errors.network'));
  }
}
```

### Errors

A failed request (`get`/`post`/`put`/`send`, or a resource's `error()`) carries the API's error
body, `ApiErrorResponse`. A Wiltech API (FastAPI) answers with one of two shapes:

| Source                                                                                 | Body                                       | Example                                                                                       |
| -------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| A business rule (`wiltech_labs_core`'s `AppError` family: 400/403/404/409/422/429/5xx) | `{ "detail": "…" }`                        | `{"detail": "An employee with this email already exists"}`                                    |
| Request validation (FastAPI/Pydantic, `422`)                                           | `{ "detail": [{ "loc", "msg", "type" }] }` | `{"detail": [{"loc": ["body", "email"], "msg": "Value error, Enter a valid email address"}]}` |

**For a banner, use `apiErrorMessage(error)`** (from 1.0.3). It takes whatever was thrown and
returns the API's own words, or `null` when there are none: the request never reached the server
(status 0), or the body isn't a Wiltech error (a proxy's HTML page). On `null`, show the app's own
"couldn't reach the server" text.

```ts
import { apiErrorMessage } from '@wiltech-labs/ngx-api-client';

try {
  await this.api.post('employee', url, payload);
} catch (error) {
  this.saveError.set(apiErrorMessage(error) ?? this.translations.t('errors.network'));
}
```

What each shape becomes:

| Body                | `apiErrorMessage()` / `summarizeApiError()`                                                                                | `fieldErrorsByField()`                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `{"detail": "…"}`   | the message as it is                                                                                                       | `{}`                                                                                        |
| `{"detail": [...]}` | `email: Enter a valid email address; …` (Pydantic's `Value error, ` prefix dropped; a model-level error has no field name) | `{ email: 'Enter a valid email address' }` (nested fields joined with dots: `address.city`) |

**To put validation errors on form fields, use `fieldErrorsByField(body)`** on the body of an
`HttpErrorResponse` the API answered:

```ts
import { HttpErrorResponse } from '@angular/common/http';
import { type ApiErrorResponse, fieldErrorsByField } from '@wiltech-labs/ngx-api-client';

if (error instanceof HttpErrorResponse && error.status !== 0) {
  const byField = fieldErrorsByField(error.error as ApiErrorResponse); // { email: '…' }
}
```

Never read `error.error.detail` by hand: that's the duplicated code these helpers replace.

## Publishing

Run from inside `packages/api-client` (this directory):

```bash
# 1. bump the version
npm version patch   # or minor / major

# 2. build — ng-packagr writes a ready-to-publish package.json into dist/
npm run build

# 3. publish the built output, not this source folder
cd dist
npm publish
```

`publishConfig.access` is already `public`, so no `--access` flag is
needed. See the root [`ngx-libraries` README](../../README.md) for the
one-time `npm login` step.
