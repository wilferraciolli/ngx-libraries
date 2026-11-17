# @wiltech-labs/ngx-organization

Org chart on a pan/zoom canvas. Wraps `ngx-interactive-org-chart` 1.5 (Angular 22, signals, MIT,
pan/zoom + mini map + collapse) with our own card template. Built 2026-10-01. See root
`../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/lib/
├── models/          # OrgItem (the API's flat item), OrgCard (what a card is drawn from)
├── config/          # NGX_ORGANIZATION_TEXT
├── utils/           # buildOrgTree (flat items → nested tree), initials
├── stores/          # OrgChartStore (feature-local, link-driven, auth-gated)
└── components/
    ├── organization-chart/  # OrganizationChart — canvas, zoom controls, opens the left panel
    ├── org-node-card/       # OrgNodeCard — one card per node type (internal)
    └── org-node-detail/     # OrgNodeDetail — left panel content (internal)
```

## Decisions

- **The API owns the structure rules** (one ORG; entities under the org or a department, never
  inside another entity, never holding jobs; departments under the org, an entity or a department
  at any depth, with at most one reporting job; jobs under departments only). The chart lays out
  what it's given and never validates. `wiltech-labs-organization` (py-libraries) is the Python
  side: the same rules, and this package's item shape.
- **People are not nodes** (the user, 2026-11-15): an occupancy is a person holding a job for a
  date range. Since 1.0.1 it travels on the job (`OrgItem.occupancies`, with `startDate`/
  `endDate`); 1.0.0's `OCCUPANCY` items are still read (deprecated), a job's own list wins.
- **The chart never edits; the app can, inside the panel.** `OrgItem.links` is carried through for
  the app to offer as actions. Since 1.0.2 `detailTemplate` puts the app's content (actions, the
  forms they open) in the detail panel below the details: Crewly's forms first sat above the
  chart, which meant scrolling up and the panel covering them (the user, 2026-11-17). The panel
  refreshes on reload and emits `panelClose`.
- **Department + reporting job = one card.** `buildOrgTree` absorbs the reporting job into its
  department and lifts the jobs filed under that job onto the department card.
- **Depends on `ngx-api-client`, `ngx-auth`, `ngx-modals`** (all sanctioned) via `file:../x/dist`.
  The node panel uses `ModalService.open(..., { side: 'left' })`, added to `ngx-modals` 1.1.0 for
  this package.
- **Gotchas found while building**:
  - The wrapped chart ignores its `initialZoom` input and always fits the whole tree on load, which
    made a real org unreadable. `expandedDepth` (start deeper levels collapsed) is the fix.
  - The mini map paints on a canvas, which can't read CSS variables: its node colour is resolved
    from the token to `rgb()` with a probe element, again when the colour scheme changes.
  - Selector is `ngx-organization-chart`; the wrapped library already owns `ngx-org-chart-mini-map`.
  - Two refinements reach the `panzoom` engine under the wrapped chart (its `panZoomInstance`, not in
    its typed API), guarded by a duck-type check so a library update only loses them: sliding the
    selected card clear of the left panel, and the phone zoom (`PHONE_SCALE`) to the root card.
- **Node panel is modeless and minimizable** (`ngx-modals` 1.2.0 `backdrop: false`,
  `minimizable: true`), one panel reused through `ModalService.update()` as the selection changes.
