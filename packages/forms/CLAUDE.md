# @wiltech-labs/ngx-forms

Shared Angular forms library — form builders, validators, and utility services for common form patterns. See root `../../CLAUDE.md` for repo-wide conventions.

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/
    └── dynamic-form/          # Configuration-driven form builder
        ├── components/
        │   ├── dynamic-form/      # @switch on FieldDef.type -> one field component per type, plus Save/Clear
        │   └── *-field/           # One Material component per field type (text, textarea, checkbox, radio,
        │                          #   select, slider, business-date, business-time, instant-date-time)
        ├── builders/              # formConfig<T>() / FormConfigBuilder
        ├── adapters/              # LocaleDateAdapter + provideLocaleDateAdapter() for the pickers
        ├── config/                # NGX_FORMS_LOCALE — app-wide date/time field locale fallback
        ├── services/              # ZonedDateTimeService (UTC instant <-> picker Date in a timezone)
        ├── shared/field-subscript/ # Hint/error line for controls with no mat-form-field
        ├── interfaces/            # FieldDef, FieldOption, BaseSchema, SchemaConfig
        ├── constants/             # FormFieldType, DateTimeConfig
        ├── styles/                # Shared SCSS mixins
        └── utils/                 # toSchema, date/time parsing + validation, MatInput error-state sync
```

## Conventions

- Real Angular constructs (`@Injectable`, `@Directive`, `@Pipe`) — not framework-agnostic functions. Every known consumer is Angular, so idiomatic DI beats a generic-TS compromise.
- One folder per concern under `src/lib/` — don't let it go flat. A new concern (e.g. validators, builders, directives) gets its own folder.
- Standalone components/directives only, no NgModules.
- Fields are Angular Material controls. Every field component has the same public contract,
  `[fieldDef]: FieldDef` + `[field]: FieldTree`, so it works inside `DynamicForm` or on its own, and
  renders its own label, hint and errors.
- Where possible put `[formField]` on the Material control itself — Material 22 reads required,
  disabled and error state from Signals Forms directly. The date/time pickers can't (they convert
  values), so they write `field().value` by hand and use `syncMatInputErrorState()` for errors.
- Validation lives in `toSchema()`, driven by `FieldDef`, never in the components.
- The showcase dev server doesn't watch `packages/forms` (it's only reached through a TS path
  mapping) — restart `ng serve` after library changes.
- **Date/time field locale**: `dateTimeConfig.locale` on a `FieldDef` always wins; the fallback when
  it's unset is `NGX_FORMS_LOCALE` (`InjectionToken<() => string>`, defaults to
  `DEFAULT_DATE_TIME_LOCALE`), not a hardcoded constant read directly — added 2026-09-30, same
  pattern as `ngx-dates`' `NGX_DATES_LOCALE` (see root `CLAUDE.md`'s "Inter-package deps": no direct
  import of `ngx-i18n`, an app wires the two together itself). Deliberately *not* defaulted to the
  browser's own language the way `ngx-dates` is — this locale also decides which typed day/month
  order `LocaleDateAdapter.parse()` accepts, so changing it changes input behaviour, not just
  wording, and an app should opt into that rather than have it happen silently.

## Status

- **Dynamic Form**: Originally ported from `AngularTutorials/signal-form-array`, since rebuilt on Angular Material with one component per field type; `apps/showcase` exercises every type.
- Not yet published to npm — under development.
- No consumers yet beyond internal experimentation.
