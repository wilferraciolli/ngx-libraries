# @wiltech/ngx-api-client

Shared Angular client for Wiltech HTTP APIs: `ApiClientService`
(GET/POST/PUT/DELETE + envelope-unwrap), the response envelope, HATEOAS-style
links, field metadata shapes, and the global error response shape returned
by a Wiltech backend (e.g. `insurly-api`'s `ApiEnvelope`/`ILink` and
`ApiError` patterns) — plus the `LinkService`/`MetadataService` and
`convertIdToValues` pipe built on them.

Built as a real Angular library (Angular Package Format, via `ng-packagr`),
so it links into a consuming Angular app the same way `@angular/*` packages
do. Requires `@angular/core`/`@angular/common`/`rxjs` as peer dependencies.

## Install

```bash
npm install @wiltech/ngx-api-client
```

`API_ORIGIN` defaults to `''` (same-origin — links resolve as relative
URLs), so nothing to configure if your frontend and backend share an
origin. Only provide it if they're on different origins, in
`app.config.ts` (or equivalent):

```ts
import { API_ORIGIN } from '@wiltech/ngx-api-client';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: API_ORIGIN, useValue: environment.apiOrigin },
  ],
};
```

## Usage

`ApiClientService` is the shared GET/POST/PUT/DELETE + envelope-unwrap
client — each feature still gets its own typed `*ApiService`, but it
delegates the HTTP mechanics to this instead of hand-rolling
`firstValueFrom(this.http.x(...))` + `_data[root]` unwrapping per method:

```ts
import { ApiClientService, ApiResource } from '@wiltech/ngx-api-client';

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

```ts
import { ApiEnvelope, SingleEnvelope, CollectionEnvelope, ILink, LinkService } from '@wiltech/ngx-api-client';

type ProviderEnvelope = SingleEnvelope<'provider', Provider>;

constructor(private links: LinkService) {}

canDelete(provider: Provider): boolean {
  return this.links.hasLink(provider.links?.deleteProvider);
}
```

```ts
import { ApiErrorResponse, fieldErrorsByField, summarizeApiError } from '@wiltech/ngx-api-client';

// in an HttpClient error handler:
catchError((err: HttpErrorResponse) => {
  const apiError = err.error as ApiErrorResponse;
  form.setErrors(fieldErrorsByField(apiError));   // { email: 'must be a valid email', ... }
  toast.show(summarizeApiError(apiError));
  return throwError(() => apiError);
})
```

```ts
import { MetadataService, IdValue } from '@wiltech/ngx-api-client';

constructor(private meta: MetadataService) {}

statusOptions = this.meta.resolveMetadataIdValues(metadata['status'] as IdValue[]); // -> ValueViewValue[] for a <mat-select>
```

```html
<!-- convertIdToValues pipe: renders a stored id as its display label -->
{{ provider.statusId | convertIdToValues: statusOptions }}
```

```ts
// standalone component/pipe usage — import the pipe directly, no NgModule needed
import { ConvertIdToStringValuePipe } from '@wiltech/ngx-api-client';

@Component({
  standalone: true,
  imports: [ConvertIdToStringValuePipe],
  // ...
})
```

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
