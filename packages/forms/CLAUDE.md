# @wiltech-labs/ngx-forms

Shared Angular forms library — form builders, validators, and utility services for common form patterns. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    └── dynamic-form/          # Configuration-driven form builder
        ├── components/
        │   ├── dynamic-form/      # Main form component (renders form fields & validation)
        │   └── error-details/     # Error display component
        ├── interfaces/
        │   ├── field-definition.ts    # FieldDef, FieldOption
        │   └── base.schema.ts         # BaseSchema, SchemaConfig
        ├── constants/
        │   └── form-field.constant.ts # FormFieldType enum
        └── utils/
            └── dynamic-form.utils.ts  # defineSchema, createEmptyEntity, toSchema
```

## Conventions

- Real Angular constructs (`@Injectable`, `@Directive`, `@Pipe`) — not framework-agnostic functions. Every known consumer is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/` — don't let it go flat. A new concern (e.g. validators, builders, directives) gets its own folder.
- Standalone components/directives only, no NgModules.

## Status

- **Dynamic Form**: Ported from `AngularTutorials/signal-form-array` — works as a standalone configuration-driven form builder that consumes Angular Signals Forms API.
- Not yet published to npm — under development.
- No consumers yet beyond internal experimentation.
