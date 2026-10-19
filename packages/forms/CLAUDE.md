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
        │                          #   select, chips, theme, slider, business-date, business-time,
        │                          #   instant-date-time)
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
  `ChipsField` is the same case for a different reason: `[formField]` binds one control to one
  value, but a chip grid adds/removes one token at a time, so it also writes `state().value.update()`
  by hand. `ThemeField`'s `mat-button-toggle-group` doesn't need this workaround — it's a
  `ControlValueAccessor` the same as `MatRadioGroup`/`MatSelect`, so `[formField]` works on it
  directly, confirmed by `RadioField` already doing the same thing on `mat-radio-group`.
- Validation lives in `toSchema()`, driven by `FieldDef`, never in the components.
- The showcase dev server doesn't watch `packages/forms` (it's only reached through a TS path
  mapping) — restart `ng serve` after library changes.
- **Date/time field locale**: `dateTimeConfig.locale` on a `FieldDef` always wins; the fallback when
  it's unset is `NGX_FORMS_LOCALE` (`InjectionToken<() => string>`, defaults to
  `DEFAULT_DATE_TIME_LOCALE`), not a hardcoded constant read directly — added 2026-09-30, same
  pattern as `ngx-dates`' `NGX_DATES_LOCALE` (see root `CLAUDE.md`'s "Inter-package deps": no direct
  import of `ngx-translations`, an app wires the two together itself). Deliberately _not_ defaulted to the
  browser's own language the way `ngx-dates` is — this locale also decides which typed day/month
  order `LocaleDateAdapter.parse()` accepts, so changing it changes input behaviour, not just
  wording, and an app should opt into that rather than have it happen silently.
- **Theme field labels**: `ThemeField`'s three icon toggles (`'light'`/`'dark'`/`'system'` — the
  third added 2026-10-02 to match `ngx-themes`' modes) read their label text from
  `fieldDef.options` — same `FieldOption[]` mechanism `RadioField`/`SelectField` already use, not a
  separate config or token. Went through two more elaborate designs first, added and then undone the
  same day (2026-10-01), each time after being asked directly to justify the shape:
  1. A component `@Input()` — would've broken once rendered through `DynamicForm`'s generic
     `@switch` (every field's contract is strictly `[fieldDef]`/`[field]`, nothing else — it has no
     way to know `ThemeField` needs a third binding and `SelectField` doesn't).
  2. An `NGX_THEME_FIELD_TEXT` DI token (app-wide default) plus a `FieldDef.themeConfig` override
     (mirroring `dateTimeConfig.locale`/`NGX_FORMS_LOCALE`) — fixed the `DynamicForm` problem, but
     introduced a whole new config shape (`ThemeFieldText` interface, a token, a merge in the
     component) for something `options: FieldOption[]` already covers. Asked directly "could this
     [`options`] not be reused" — it could, and should: `ThemeField`'s two values are fixed
     (`'light'`/`'dark'`, each tied to its own icon) so `options` only ever supplies each one's label,
     same shape `RadioField`/`SelectField` already have, no new type or token needed at all. This is
     also what every other choice-list field in this package does — repeat its own `choices` at each
     call site, no shared "app-wide select option translations" token exists for `RadioField`/
     `SelectField` either, so the token/config detour was actually _less_ consistent with the rest of
     the package, not more.

## Status

- **Dynamic Form**: Originally ported from `AngularTutorials/signal-form-array`, since rebuilt on Angular Material with one component per field type; `apps/showcase` exercises every type.
- Not yet published to npm — under development.
- No consumers yet beyond internal experimentation.
