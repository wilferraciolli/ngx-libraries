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

- **The API owns the structure rules** (one ORG; entities under the org or a department, at most one
  per reporting line, never holding jobs; departments with exactly one reporting job; jobs under
  departments; one occupancy per job, many jobs per person). The chart lays out what it's given and
  never validates.
- **Read-only for now.** `OrgItem.links` is carried through for the CRUD actions that come next.
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
