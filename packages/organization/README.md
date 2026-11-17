# @wiltech-labs/ngx-organization

Org chart for Angular apps on a pan-and-zoom canvas (drag to move, wheel or pinch to zoom, overview
mini map), built on [`ngx-interactive-org-chart`](https://www.npmjs.com/package/ngx-interactive-org-chart)
and styled from the app's Material 3 tokens.

- One **organization** at the top; **entities** and **departments** under it; **jobs** under
  departments. **People** hold jobs for a time; they're not nodes.
- A department's **reporting job** is merged into its card, so its manager is read as part of it.
- A job shows the **person** holding it (the panel says since when), or a dashed **Vacant** card.
- Deeper levels start collapsed (`expandedDepth`), so a large organization opens at a readable size;
  each card's expand button shows how many sit beneath it.
- Clicking a card outlines it and opens its details in an [`ngx-modals`](../modals) panel on the
  **left**. The panel is modeless: the chart stays usable beside it, clicking another card swaps
  what it shows, and it can be minimized to a bar and restored. If the card sits under the panel,
  the chart slides it clear. Emits `nodeSelect`. Read-only for now.
- On phones the chart opens zoomed to the top of the tree at a readable size, one level expanded,
  without the mini map.

## Install

```bash
npm install @wiltech-labs/ngx-organization
```

`ngx-interactive-org-chart` uses `panzoom`, a CommonJS module. Add it to the app's `angular.json`
`build.options.allowedCommonJsDependencies` to silence the build warning:

```json
"allowedCommonJsDependencies": ["panzoom"]
```

## Usage

```ts
import { OrganizationChart, type OrgItem } from '@wiltech-labs/ngx-organization';

@Component({
  imports: [OrganizationChart],
  template: `<ngx-organization-chart [items]="items()" (nodeSelect)="selected.set($event)" />`,
})
```

| Name            | Type                   | Default | Notes                                            |
| --------------- | ---------------------- | ------- | ------------------------------------------------ |
| `items`         | `OrgItem[]` (required) |         | The API's flat list.                             |
| `expandedDepth` | `number`               | `2`     | Levels below the organization expanded at first. |
| `showMiniMap`   | `boolean`              | `true`  |                                                  |
| `detailTemplate` | `TemplateRef<OrgDetailContext>` | none | The app's own panel content, below the details (1.0.2). |
| `nodeSelect`    | output `OrgItem`       |         | The item behind the clicked card.                |
| `panelClose`    | output `void`          |         | The detail panel closed (1.0.2).                 |

The chart is `clamp(480px, 75dvh, 960px)` tall; set `--ngx-organization-chart-height` to change it.

### The app's own content in the panel (1.0.2)

Pass `detailTemplate` to show the app's actions, and the forms they open, inside the detail panel,
below the details. Editing then happens beside the chart: no form above it to scroll to, nothing
for the panel to cover. The template's context is the chosen item (`let-item`) and its `card`; it
keeps the page's injector and bindings, so it reads the page's own store.

```html
<ngx-organization-chart
  [items]="store.items()"
  [detailTemplate]="actions"
  (nodeSelect)="chosen.set($event)"
  (panelClose)="store.cancel()"
/>
<ng-template #actions let-item>
  @if (store.editing()) { <app-department-form ... /> } @else { <button ...>Add a job</button> }
</ng-template>
```

When `items` reload (after a save), the open panel stays on the same item and shows it as it is
now; it closes if the item is gone.

### Data

The API owns every structure rule; the chart only lays out what it's given. For Python APIs,
[`wiltech-labs-organization`](https://pypi.org/project/wiltech-labs-organization/) holds the rules
and sends this shape. Nodes form a flat list, each pointing at its parent:

```ts
interface OrgItem {
  id: string;
  type: 'ORG' | 'ORG_ENTITY' | 'DEPARTMENT' | 'JOB';
  name: string; // organization / entity / department name, or the job's title
  parentId: string | null; // null only for the ORG
  description?: string;
  reportingJobId?: string | null; // DEPARTMENT: the JOB that heads it, if any
  occupancies?: OrgOccupancy[] | null; // JOB: who holds it on the chart's date
  links?: Record<string, ILink>; // actions the API allows, for the app to offer
}

interface OrgOccupancy {
  id: string;
  personId: string; // the same across every job the person holds
  name: string; // the person's name
  startDate?: string; // ISO date, included
  endDate?: string | null; // ISO date, included; none: still holding it
  links?: Record<string, ILink>;
}
```

The structure rules:

| Node         | Sits under                                       | Notes                                              |
| ------------ | ------------------------------------------------ | -------------------------------------------------- |
| `ORG`        | nothing                                          | Exactly one, at the top                            |
| `ORG_ENTITY` | the `ORG` or a `DEPARTMENT`                      | Never inside another entity: at most one on a line |
| `DEPARTMENT` | the `ORG`, an `ORG_ENTITY` or a `DEPARTMENT`     | Any depth; at most one reporting job               |
| `JOB`        | a `DEPARTMENT` only                              | Never under the `ORG` or an `ORG_ENTITY`           |

- **People are not nodes.** An occupancy is a person holding a job from one date to another; it
  travels on the job. The API sends the occupancies on the chart's date (usually today); the card
  shows the first, a job with none is **Vacant**. A person can hold several jobs.
- A department's reporting job has the department as its parent. Other jobs in the department may
  point at the department or at the reporting job; both draw under the department card.
- 1.0.0 sent people as `OCCUPANCY` items (`parentId` = the job). Those are still read, but
  deprecated: send `occupancies` on the job.

### Loading from the API

`OrgChartStore` loads `_data.orgNodes` from a link the app hands it, gated on `ngx-auth`'s
`AuthStore.isSignedIn()`, the same way `ngx-region-settings`' stores work. Feature-local:

```ts
@Component({
  providers: [OrgChartStore],
  template: `<ngx-organization-chart [items]="store.items()" />`,
})
export class OrgPage {
  protected readonly store = inject(OrgChartStore);
  constructor() {
    this.store.load(inject(CurrentUserStore).link('orgChart'));
  }
}
```

### Text

`NGX_ORGANIZATION_TEXT` holds every label (type names, Vacant, Since, zoom controls...), default
English. Override it to translate, the same resolver pattern as the other packages' text tokens. A
provider on the page reaches the detail panel too: the chart opens it with its own injector.

### Theming

Each type owns a Material colour role: organization primary, entity tertiary, department
secondary, jobs a primary accent. An app whose tertiary means something else (Crewly's accent is
time away from work) re-points `--mat-sys-tertiary*` on a wrapper around the chart. The canvas is `surface-container-lowest` with a soft primary-to-tertiary wash and
a dot grid; override it with `--ngx-organization-canvas`, and cards with `--ngx-org-card-background`.

## Status

`1.0.1` published (2026-11-15): occupancies on the job, with dates. `1.0.2` (2026-11-17, not
published): `detailTemplate` and `panelClose`, so an app edits inside the panel. Consumed by `apps/showcase`
(`/organization`) and Crewly's org chart, whose API sends this shape through
`wiltech-labs-organization`.

## Publishing

```bash
cd packages/organization
npm run build
```

`ngx-api-client`, `ngx-auth` and `ngx-modals` are `file:../x/dist` dependencies (see root
`CLAUDE.md`'s "Inter-package deps"); build them first, or use `npm run build:packages` from the repo
root. `postbuild` rewrites them to real version ranges in `dist/package.json` automatically. Then:

```bash
cd dist
npm publish
```

Bump `version` in the source `package.json` before building.
