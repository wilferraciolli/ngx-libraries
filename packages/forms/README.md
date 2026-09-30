# @wiltech-labs/ngx-forms

Configuration-driven Angular forms built on the **Signals Forms API** (`@angular/forms/signals`)
and **Angular Material**. Describe your fields once, then either render the whole form with
`DynamicForm` or place individual field components in your own layout.

## Features

- **`DynamicForm`** — renders a full form (fields + Save/Clear) from a list of field definitions
- **Field components** — every field type is a standalone Material component you can use on its own
- **`formConfig<T>()` builder** — fluent, type-checked way to write the config; field names are checked against your model
- **Validation from config** — `required`, `minLength`/`maxLength`, `min`/`max`, date/time ranges and `disabled`, shown inline under each field once touched
- **Date and time done properly** — timezone-aware instants and timezone-free business dates/times, displayed in a chosen locale rather than the browser's

## Installation

```bash
npm install @wiltech-labs/ngx-forms
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/material` (all `^22`).
`temporal-polyfill` is installed with the package.

The fields are Angular Material components and take the app's own M3 theme (`mat.theme()`) — in an
app that follows the house conventions there's nothing to add. An app without a theme needs one, and
the Roboto font, e.g.:

```css
/* styles.css */
@import '@angular/material/prebuilt-themes/azure-blue.css';
```

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.gstatic.com" />
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
```

## Usage with DynamicForm

### 1. Describe the model and its fields

```typescript
import { formConfig } from '@wiltech-labs/ngx-forms';
import type { BaseSchema, SchemaConfig } from '@wiltech-labs/ngx-forms';

export interface FlightSchema extends BaseSchema {   // BaseSchema adds `id` and `schemaType`
  schemaType: 'flight';
  from: string;
  to: string;
  departure: string;
  cabin: string;
  delayed: boolean;
}

export const flightFormConfig: SchemaConfig<FlightSchema> = formConfig<FlightSchema>('flight')
  .text('from', 'Departure City', { required: true, minLength: 3, maxLength: 20 })
  .text('to', 'Destination City', { required: true, minLength: 3, maxLength: 20 })
  .instantDateTime('departure', 'Departure', {
    required: true,
    hint: 'Local time at the departure airport',
    dateTimeConfig: { timeZone: 'Europe/London', min: '2026-01-01T00:00:00Z' }
  })
  .select('cabin', 'Cabin', [
    { label: 'Economy', value: 'economy' },
    { label: 'Business', value: 'business' }
  ], { required: true })
  .checkbox('delayed', 'Delayed')
  .build({ from: '', to: '', departure: '', cabin: 'economy', delayed: false });
```

`build()` returns `{ schemaType, fields, initialValue }`, with `id` and `schemaType` filled in on the
initial value. A misspelled or renamed field name is a compile error.

### 2. Render it

```typescript
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { DynamicForm, toSchema } from '@wiltech-labs/ngx-forms';
import { flightFormConfig } from './flight-form.config';
import type { FlightSchema } from './flight-form.config';

@Component({
  selector: 'app-flight-form',
  imports: [DynamicForm],
  template: `
    <ngx-dynamic-form
      [metaInfo]="config.fields"
      [dynamicForm]="flightForm"
      (onFormSubmit)="save()"
      (onFormClear)="clear()"
    />
  `
})
export class FlightFormComponent {
  protected readonly config = flightFormConfig;
  protected readonly flight = signal(flightFormConfig.initialValue);
  protected readonly flightForm = form(this.flight, toSchema<FlightSchema>(flightFormConfig.fields));

  protected save(): void {
    console.log('Saved', this.flight());
  }

  protected clear(): void {
    this.flight.set(flightFormConfig.initialValue);
    this.flightForm().reset();
  }
}
```

The actions sit right-aligned: a text **Clear** and a filled **Save**. Name them after what they do
with `clearLabel`/`submitLabel` — e.g. `clearLabel="Cancel"` when that button leaves the form (it
still emits `onFormClear`).

`toSchema()` turns the field definitions into Signals Forms validation rules. Save is only enabled
while the form is valid, and `onFormSubmit` only fires for a valid form.

## Usage with individual fields

Every field component takes the same two inputs — a `[fieldDef]` and the `[field]` from your
Signals Form — so you can use them without `DynamicForm`, in any layout. The model can be any plain
object; it doesn't need `id` or `schemaType`.

```typescript
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  BusinessDateField, CheckboxField, FormFieldType, TextField, toSchema
} from '@wiltech-labs/ngx-forms';
import type { FieldDef } from '@wiltech-labs/ngx-forms';

interface Newsletter {
  email: string;
  startDate: string;
  agree: boolean;
}

@Component({
  selector: 'app-newsletter',
  imports: [TextField, BusinessDateField, CheckboxField],
  template: `
    <ngx-text-field [fieldDef]="fields.email" [field]="newsletterForm.email" />
    <ngx-business-date-field [fieldDef]="fields.startDate" [field]="newsletterForm.startDate" />
    <ngx-checkbox-field [fieldDef]="fields.agree" [field]="newsletterForm.agree" />
    <button [disabled]="newsletterForm().invalid()" (click)="subscribe()">Subscribe</button>
  `
})
export class NewsletterComponent {
  protected readonly fields = {
    email: { name: 'email', type: FormFieldType.TEXT, label: 'Email', required: true },
    startDate: {
      name: 'startDate',
      type: FormFieldType.BUSINESS_DATE,
      label: 'Start from',
      required: true,
      dateTimeConfig: { min: '2026-01-01', locale: 'en-GB' }
    },
    agree: { name: 'agree', type: FormFieldType.CHECKBOX, label: 'I agree to receive emails', required: true }
  } satisfies Record<keyof Newsletter, FieldDef>;

  protected readonly newsletter = signal<Newsletter>({ email: '', startDate: '', agree: false });
  protected readonly newsletterForm = form(this.newsletter, toSchema<Newsletter>(Object.values(this.fields)));

  protected subscribe(): void {
    console.log(this.newsletter());
  }
}
```

Each component renders its own label, hint, required marker and errors, and fills the width of its
container. `DynamicForm` adds no padding or background of its own — put it in the app's surface
(e.g. a tonal panel); cap a single field with `maxWidth`.

## Field types

| `FormFieldType` | Builder method | Component | Value | Material control |
|---|---|---|---|---|
| `TEXT` | `text()` | `TextField` | `string` | `matInput` |
| `EMAIL` | `email()` | `TextField` | `string` | `matInput` (`type="email"`), plus a valid-address check |
| `PASSWORD` | `password()` | `TextField` | `string` | `matInput` (masked) |
| `SEARCH` | `search()` | `TextField` | `string` | `matInput` |
| `NUMBER` | `number()` | `TextField` | `number` | `matInput` |
| `TEXTAREA` | `textarea()` | `TextareaField` | `string` | `matInput` textarea, auto-growing |
| `CODE` | `code()` | `TextareaField` | `string` | Monospaced textarea, Tab indents |
| `CHECKBOX` | `checkbox()` | `CheckboxField` | `boolean` | `mat-checkbox` |
| `RADIO` | `radio(name, label, choices)` | `RadioField` | option value | `mat-radio-group` |
| `SELECT` | `select(name, label, choices)` | `SelectField` | option value | `mat-select` |
| `RANGE` | `range()` | `SliderField` | `number` | `mat-slider` (`min`/`max`/`step`, default 0–100) |
| `BUSINESS_DATE` | `businessDate()` | `BusinessDateField` | `'YYYY-MM-DD'` | Datepicker |
| `BUSINESS_TIME` | `businessTime()` | `BusinessTimeField` | `'HH:mm'` | Timepicker |
| `INSTANT_DATE_TIME` | `instantDateTime()` | `InstantDateTimeField` | UTC `'YYYY-MM-DDThh:mm:ssZ'` | Datepicker + timepicker |

Use `hidden(name)` on the builder for a field that belongs to the model and its validation but is never shown.

### Choosing a date/time field

- **`BUSINESS_DATE`** — a calendar date with no timezone: birthdays, holidays, due dates. Christmas Day is the 25th wherever it's read.
- **`BUSINESS_TIME`** — a time of day with no date or timezone: opening hours, daily schedules. "Opens at 09:00" means 09:00 in whichever shop you walk into.
- **`INSTANT_DATE_TIME`** — an exact moment, stored in UTC and edited as the wall-clock time of `dateTimeConfig.timeZone`: meetings, deadlines, flights. When a time falls in a daylight-saving gap or overlap, the field explains how it was resolved.

All three display and parse dates in `dateTimeConfig.locale` (default `'en-GB'`, so `31/12/2026`),
never the browser's locale — typing `31/12/2026` works for any day-first locale.

### App-wide default locale

`dateTimeConfig.locale` set on a field always wins. When it's unset, the fallback comes from
`NGX_FORMS_LOCALE` (an `InjectionToken<() => string>`), not a hardcoded constant — provide it once
in `app.config.ts` to change every field's default locale together, e.g. wired to
[`@wiltech-labs/ngx-translations`](../translations):

```ts
import { inject } from '@angular/core';
import { NGX_FORMS_LOCALE } from '@wiltech-labs/ngx-forms';
import { TranslationsService } from '@wiltech-labs/ngx-translations';

{
  provide: NGX_FORMS_LOCALE,
  useFactory: () => { const translations = inject(TranslationsService); return () => translations.locale(); }
}
```

Unlike `ngx-dates`' `NGX_DATES_LOCALE` (read-only display text), this locale also decides which
*typed* day/month order the picker's input accepts — changing it changes user input behaviour, not
just wording, so it isn't defaulted to the browser's own language the way `ngx-dates` is. Leave it
unset and every field keeps today's default (`'en-GB'`).

## Field definition

```typescript
interface FieldDef {
  name: string;                     // Property name in the model
  type: FormFieldType;
  label: string;
  required?: boolean;
  minLength?: number;               // Text fields
  maxLength?: number;               // Text fields
  pattern?: RegExp | string;        // Text fields: a RegExp is used as-is; a string must match the whole value
  patternMessage?: string;          // Error when `pattern` doesn't match. Default: "<label> is not in the expected format"
  min?: number;                     // Number and range fields
  max?: number;                     // Number and range fields
  step?: number;                    // Range fields
  options?: FieldOption[];          // Radio and select: [{ label, value }]
  orientation?: 'horizontal' | 'vertical'; // Radio: a wrapping row (default) or one option per line
  dateTimeConfig?: DateTimeConfig;  // Business date/time and instant date-time
  hidden?: boolean;                 // Part of the model, never rendered
  disabled?: boolean;               // Rendered but not editable
  hint?: string;                    // Help text under the field
  maxWidth?: string;                // DynamicForm only: caps this field's width, Eg '400px'
}

interface DateTimeConfig {
  locale?: string;                  // Display/typing format, Eg 'en-GB', 'en-US', 'el-CY'. Default 'en-GB'.
  min?: string;                     // In the field's own value format: '2026-12-25', '09:00' or '2026-01-01T00:00:00Z'
  max?: string;
  timeZone?: string;                // Instant only: IANA zone, Eg 'Europe/London'. Default: the user's timezone.
  disambiguation?: 'earlier' | 'later';  // Instant only: which occurrence when a time happens twice
}
```

## Validation

`toSchema()` turns each `FieldDef` into Signals Forms rules, with messages built from the label:

| Config | Rule | Message |
|---|---|---|
| `required: true` | `required()` | "Email is required" |
| `minLength` / `maxLength` | `minLength()` / `maxLength()` | "Username must be at least 3 characters" |
| `min` / `max` | `min()` / `max()` | "Age must be at least 18" |
| type `EMAIL` | `email()` | "Email must be a valid email address" |
| `pattern` (+ `patternMessage`) | `pattern()` | your `patternMessage`, or "Username is not in the expected format" |
| `dateTimeConfig.min` / `max` | custom | "Closed on cannot be after 2026-12-31" |
| `disabled: true` | `disabled()` | — (field shown but not editable) |

There's no separate `requiredTrue`: `required` treats `false` as empty, so `required: true` on a
checkbox means it must be ticked (Eg "Accept terms").

```typescript
formConfig<SignUp>('signUp')
  .text('username', 'Username', {
    required: true,
    pattern: '[a-z0-9.]+',                 // whole value must match
    patternMessage: 'Use lowercase letters, digits and dots only'
  })
  .email('email', 'Email', { required: true })
  .checkbox('terms', 'I accept the terms', { required: true })
  .build({ username: '', email: '', terms: false });
```

A string `pattern` is wrapped as `^(?:…)$`, like HTML's `pattern` attribute, and can be stored in
JSON config. Pass a `RegExp` instead when you want a partial match or flags.

## Other exports

- `toSchema(fields)` — field definitions to Signals Forms rules
- `createEmptyEntity(schemaType, values)` / `defineSchema(config)` — build a `SchemaConfig` by hand instead of with the builder
- `ZonedDateTimeService` — converts between UTC instants and picker `Date`s in a given timezone, resolving daylight-saving gaps and overlaps

## Layout

```
src/
├── public-api.ts        # barrel — the entire public surface; nothing outside this is exported
└── lib/dynamic-form/
    ├── components/      # DynamicForm + one Material component per field type
    ├── builders/        # formConfig<T>() / FormConfigBuilder
    ├── adapters/        # Locale-aware DateAdapter for the pickers
    ├── services/        # ZonedDateTimeService
    ├── shared/          # Hint/error line for controls without a mat-form-field
    ├── interfaces/      # FieldDef, FieldOption, BaseSchema, SchemaConfig
    ├── constants/       # FormFieldType, DateTimeConfig
    ├── styles/          # Shared SCSS mixins
    └── utils/           # toSchema, date/time parsing and validation
```

## Status

Not yet published to npm — under development. The `apps/showcase` app demonstrates every field type.

## Publishing

To publish this package to npm:

```bash
cd packages/forms
npm run build
cd dist
npm publish
```

Ensure `version` in `package.json` is updated before publishing per semver conventions.
