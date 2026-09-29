# NGX Libraries Showcase

A demo Angular application for testing and showcasing the shared libraries in this monorepo.

## Available Libraries

- **@wiltech-labs/ngx-api-client** — HTTP client service with envelope unwrap and HATEOAS support
- **@wiltech-labs/ngx-forms** — Configuration-driven dynamic form builder
- **@wiltech-labs/ngx-media** — Skeleton loaders and a YouTube player
- **@wiltech-labs/ngx-ai-tools** — Gradient panels, text boxes and buttons with an AI-assist look and feel
- **@wiltech-labs/ngx-graphs** — All 8 non-mixed chart.js chart types, built on ng2-charts
- **@wiltech-labs/ngx-i18n** — Instant (no-reload) language switching, translation pipe/service
- **@wiltech-labs/ngx-dates** — `relativeTime` pipe, exercised inside the i18n demo (no separate route)

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
- **i18n Demo** (`/i18n`) — Language switcher, the `t` pipe/service, `formatDate()`/`formatNumber()`,
  and `ngx-dates`' `relativeTime` pipe reacting to the same switch

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
│       └── i18n-demo/            # ngx-i18n + ngx-dates demo
├── i18n/                          # Demo dictionaries (en-GB.json, el-GR.json) for ngx-i18n
├── main.ts                        # Application entry point (bootstrapApplication + providers)
├── index.html                     # HTML template
└── styles.css                     # Global styles
```

## Adding New Demos

To add a demo for a new library:

1. Create a new component in `src/app/demos/<library-name>/`
2. Add the component to the routes in `app.routes.ts`
3. Add a card to the home page listing
4. Import and use the library's components and services

## Notes

- This app uses standalone components (no NgModules)
- The app links directly to local packages via path mappings
- For testing with published packages, update the `@wiltech-labs/*` dependencies in `package.json`
