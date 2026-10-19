# NGX Libraries Showcase

A demo Angular application for testing and showcasing the shared libraries in this monorepo.

## Available Libraries

- **@wiltech-labs/ngx-api-client** — HTTP client service with envelope unwrap and HATEOAS support
- **@wiltech-labs/ngx-forms** — Configuration-driven dynamic form builder
- **@wiltech-labs/ngx-media** — Skeleton loaders and a YouTube player
- **@wiltech-labs/ngx-ai-tools** — Gradient panels, text boxes and buttons with an AI-assist look and feel
- **@wiltech-labs/ngx-graphs** — All 8 non-mixed chart.js chart types, built on ng2-charts
- **@wiltech-labs/ngx-translations** — Instant (no-reload) language switching, translation pipe/service
- **@wiltech-labs/ngx-dates** — `relativeTime` pipe, exercised inside the translations demo (no separate route)
- **@wiltech-labs/ngx-calendar** — Day/week/month calendar with a day agenda and an event edit panel
- **@wiltech-labs/ngx-organization** — Org chart on a pan/zoom canvas with a node detail panel
- **@wiltech-labs/ngx-modals** — Right-docked panel: approve/reject with data passed in, and a
  plain sign-up form, both with a typed close result
- **@wiltech-labs/ngx-notifications** — Polling bell + badge + dropdown panel, in-memory fake data
- **@wiltech-labs/ngx-region-settings** — `RegionSettingsFormComponent` with hardcoded initial
  values, no backend
- **@wiltech-labs/ngx-components** — Banner, Panel and Card, no backend
- **@wiltech-labs/ngx-themes** — the navbar's light/dark toggle and palette menu; the four palette
  families themselves live in `src/styles/themes/` and are registered with `provideThemes()` in
  `main.ts`

`@wiltech-labs/ngx-web-sockets` is deliberately **not** wired in here — there's no Socket.IO backend
for it to connect to yet. See that package's own `CLAUDE.md`.

## Getting Started

### Prerequisites

- Node.js 20+ (same as packages)
- npm 10+

### Installation

From the monorepo root:

```bash
npm install
```

The showcase app automatically links to local packages via the monorepo's npm workspaces configuration.

### Development Server

Run the development server:

```bash
npm -w ngx-showcase start
```

Or from this directory:

```bash
npm start
```

Navigate to `http://localhost:4200/` to see the application.

### Testing the Libraries

- **Home** (`/`) — Overview of all available libraries
- **API Client Demo** (`/api-client`) — Interactive testing of the ApiClientService with different HTTP methods
- **Forms Demo** (`/forms`) — Every field type, including the three Temporal-backed date/time fields
- **Media Demo** (`/media`) — Loading skeletons and the YouTube player, both loading and loaded states
- **AI Tools Demo** (`/ai-tools`) — Gradient panel/text box/button and the sparkle icon
- **Graphs Demo** (`/graphs`) — All 8 chart types, each with its "Show data" table toggle
- **Translations Demo** (`/translations`) — Language switcher, the `t` pipe/service, `formatDate()`/`formatNumber()`,
  and `ngx-dates`' `relativeTime` pipe reacting to the same switch
- **Calendar Demo** (`/calendar`, lazy) — Sample events around today; pick a day, open an event, Edit and Save
- **Organization Demo** (`/organization`, lazy) — A sample group with entities, departments, vacant jobs and a
  person holding two jobs
- **Modals Demo** (`/modals`) — Approve/reject with data passed in, and a plain sign-up form, each
  closing with a typed result
- **Notifications Demo** (`/notifications`) — Click the bell for the right-docked panel; "View"
  marks an item read, the X dismisses it
- **Region Settings Demo** (`/region-settings`) — Timezone/language/locale/currency/theme form,
  Save only enables once something changes
- **Components Demo** (`/components`) — Banner (info/warning/error), Panel (with and without an
  icon/subheader), and Card

### Building

Build the showcase app:

```bash
npm -w ngx-showcase run build
```

Output will be in `dist/browser/`.

## Project Structure

```
src/
├── app/
│   ├── app.component.ts          # Root component with navigation
│   ├── app.routes.ts             # Route configuration
│   ├── home/                      # Home page component
│   └── demos/
│       ├── api-client-demo/      # API client testing demo
│       ├── forms-demo/           # Forms library demo
│       ├── media-demo/           # Loading skeletons + YouTube player demo
│       ├── ai-tools-demo/        # AI surfaces demo
│       ├── graphs-demo/          # All 8 chart types demo
│       ├── translations-demo/    # ngx-translations + ngx-dates demo
│       ├── calendar-demo/        # ngx-calendar demo
│       ├── organization-demo/    # ngx-organization demo
│       ├── modals-demo/          # ngx-modals demo
│       ├── notifications-demo/   # ngx-notifications demo
│       ├── region-settings-demo/ # ngx-region-settings demo
│       └── components-demo/      # ngx-components demo
├── translations/                  # Demo dictionaries (en-GB.json, el-GR.json) for ngx-translations
├── main.ts                        # Application entry point (bootstrapApplication + providers)
├── index.html                     # HTML template
└── styles.scss                    # Global styles + M3 theme families (see styles/themes/)
```

## Adding New Demos

To add a demo for a new library:

1. Create a new component in `src/app/demos/<library-name>/`
2. Add the component to the routes in `app.routes.ts`
3. Add a card to the home page listing
4. Import and use the library's components and services

## Notes

- This app uses standalone components (no NgModules)
- All styles are SCSS — `angular.json` sets `scss` as the component schematic default and the
  `inlineStyleLanguage`, so `ng generate component` never creates a `.css` file
- The app links directly to local packages via path mappings
- For testing with published packages, update the `@wiltech-labs/*` dependencies in `package.json`
