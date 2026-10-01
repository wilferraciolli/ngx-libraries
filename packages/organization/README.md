# @wiltech-labs/ngx-organization

Org chart for Angular apps on a pan-and-zoom canvas (drag to move, wheel or pinch to zoom, overview
mini map), built on [`ngx-interactive-org-chart`](https://www.npmjs.com/package/ngx-interactive-org-chart)
and styled from the app's Material 3 tokens.

- One **organization** at the top; **entities** and **departments** under it; **jobs** under
  departments.
- A department's **reporting job** is merged into its card, so its manager is read as part of it.
- A job shows the **person** holding it, or a dashed **Vacant** card.
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
| `nodeSelect`    | output `OrgItem`       |         | The item behind the clicked card.                |

The chart is `clamp(480px, 75dvh, 960px)` tall; set `--ngx-organization-chart-height` to change it.

### Data

The API owns every structure rule; the chart only lays out what it's given. Items form a flat list,
each pointing at its parent:

```ts
interface OrgItem {
  id: string;
  type: 'ORG' | 'ORG_ENTITY' | 'DEPARTMENT' | 'JOB' | 'OCCUPANCY';
  name: string; // organization / entity / department / job title, or the person's name
  parentId: string | null; // null only for the ORG
  description?: string;
  reportingJobId?: string | null; // DEPARTMENT: the JOB that heads it
  personId?: string; // OCCUPANCY: the same across every job the person holds
  links?: Record<string, ILink>; // actions the API allows (not rendered yet)
}
```

- `OCCUPANCY` is a person in a job (`parentId` = the job). It's shown on the job's card, never as a
  card of its own. A job has at most one; a person can hold several jobs.
- A department's reporting job has the department as its parent. Other jobs in the department may
  point at the department or at the reporting job; both draw under the department card.

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

`NGX_ORGANIZATION_TEXT` holds every label (type names, Vacant, zoom controls...), default English.
Override it to translate, the same resolver pattern as the other packages' text tokens.

### Theming

Each type owns an M3 colour role: organization primary, entity tertiary, department secondary, jobs
a primary accent. The canvas is `surface-container-lowest` with a soft primary-to-tertiary wash and
a dot grid; override it with `--ngx-organization-canvas`, and cards with `--ngx-org-card-background`.

## Status

`0.1.0`, not yet published. Consumed only by `apps/showcase` (`/organization`). The API response
shape is a proposal; agree it with the API before the first real consumer.

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
