# @wiltech-labs/ngx-forms

Shared Angular forms library — form builders, validators, and utility services for common form patterns used across Wiltech Angular applications.

## Features

- Form builders and patterns
- Custom validators
- Form utility services

## Installation

```bash
npm install @wiltech-labs/ngx-forms
```

## Usage

```typescript
import { /* your imports */ } from '@wiltech-labs/ngx-forms';
```

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    └── (form-related utilities and services)
```

## Conventions

- Real Angular constructs (`@Injectable`, `@Directive`, `@Pipe`) — not framework-agnostic functions
- One folder per concern under `src/lib/` — organize by feature or type (e.g. `validators/`, `builders/`, `directives/`)
- A new concern gets its own folder, not a file dropped flat

## Status

Not yet published to npm — under development.

## Publishing

To publish this package to npm:

```bash
cd packages/forms
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
