# NGX Libraries Showcase

A demo Angular application for testing and showcasing the shared libraries in this monorepo.

## Available Libraries

- **@wiltech-labs/ngx-api-client** — HTTP client service with envelope unwrap and HATEOAS support
- **@wiltech-labs/ngx-forms** — Configuration-driven dynamic form builder

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

- **Home** — Overview of all available libraries
- **API Client Demo** — Interactive testing of the ApiClientService with different HTTP methods
- **Forms Demo** — Example of the DynamicForm component with a sample user registration form

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
│       └── forms-demo/           # Forms library demo
├── main.ts                        # Application entry point
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
