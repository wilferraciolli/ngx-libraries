# @wiltech-labs/ngx-forms

Shared Angular forms library — form builders, validators, and utility services for common form patterns used across Wiltech Angular applications.

## Features

- **Dynamic Form Builder**: Configuration-driven form generator with built-in validation
- Custom validators
- Form utility services
- Support for multiple field types (text, password, date, select, radio, checkbox, range, etc.)

## Installation

```bash
npm install @wiltech-labs/ngx-forms
```

## Dynamic Form Usage

The dynamic form builder allows you to create reactive forms from a configuration object without manually building form groups.

### Basic Example

```typescript
import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  DynamicForm,
  FormFieldType,
  BaseSchema,
  SchemaConfig,
  defineSchema,
  createEmptyEntity,
  toSchema
} from '@wiltech-labs/ngx-forms';

// 1. Define your entity schema
interface FlightSchema extends BaseSchema {
  schemaType: 'flight';
  from: string;
  to: string;
  date: string;
  delayed: boolean;
}

// 2. Define the form configuration
const flightFormConfig: SchemaConfig<FlightSchema> = defineSchema<FlightSchema>({
  schemaType: 'flight',
  fields: [
    { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
    { name: 'from', type: FormFieldType.TEXT, label: 'From', required: true, minLength: 3, maxLength: 20 },
    { name: 'to', type: FormFieldType.TEXT, label: 'To', required: true, minLength: 3, maxLength: 20 },
    { name: 'date', type: FormFieldType.INSTANT_DATE_TIME, label: 'Departure', required: true, dateTimeConfig: { timeZone: 'Europe/London' } },
    { name: 'delayed', type: FormFieldType.CHECKBOX, label: 'Delayed' }
  ],
  initialValue: createEmptyEntity<FlightSchema>('flight', {
    from: '',
    to: '',
    date: '',
    delayed: false
  })
});

@Component({
  selector: 'app-flight-form',
  standalone: true,
  imports: [DynamicForm],
  template: `
    <app-dynamic-form
      [metaInfo]="flightFormConfig.fields"
      [dynamicForm]="flightForm"
      (onFormSubmit)="handleSubmit()"
      (onFormClear)="handleClear()"
    />
  `
})
export class FlightFormComponent {
  readonly flightFormConfig = flightFormConfig;
  readonly flightEntity = signal(flightFormConfig.initialValue);
  readonly flightForm = form(
    this.flightEntity,
    toSchema<FlightSchema>(flightFormConfig.fields)
  );

  protected handleSubmit(): void {
    console.log('Flight data:', this.flightEntity());
  }

  protected handleClear(): void {
    this.flightEntity.set(flightFormConfig.initialValue);
    this.flightForm().reset();
  }
}
```

### Field Types

The dynamic form supports the following field types (via `FormFieldType` enum):

- `TEXT` - Text input
- `PASSWORD` - Password input
- `SEARCH` - Search input
- `RADIO` - Radio button group (requires `options`)
- `SELECT` - Dropdown select (requires `options`)
- `CHECKBOX` - Checkbox input
- `NUMBER` - Number input
- `RANGE` - Range slider (`min`/`max`/`step`)
- `TEXTAREA` - Multi-line text
- `CODE` - Monospaced multi-line text, Tab indents
- `BUSINESS_DATE` - Calendar date with no timezone, value `'YYYY-MM-DD'` (Eg Christmas Day)
- `BUSINESS_TIME` - Time of day with no timezone, value `'HH:mm'` (Eg opens at 09:00)
- `INSTANT_DATE_TIME` - Exact moment, value a UTC instant `'YYYY-MM-DDThh:mm:ssZ'`, edited in `dateTimeConfig.timeZone`

The three date/time fields use the Angular Material datepicker/timepicker and share `dateTimeConfig`:

```typescript
interface DateTimeConfig {
  locale?: string;          // Display and typing format, Eg 'en-GB' (31/03/2024) or 'en-US'. Defaults to 'en-GB'.
  min?: string;             // In the field's own value format: '2024-12-25', '09:00' or '2024-01-01T00:00:00Z'
  max?: string;
  timeZone?: string;        // INSTANT_DATE_TIME only. Defaults to the user's timezone.
  disambiguation?: 'earlier' | 'later';  // INSTANT_DATE_TIME only: which occurrence when a time happens twice
}
```

The format follows `locale`, never the browser's, because each field has its own `DateAdapter`.
`ZonedDateTimeService` is exported too, for converting between UTC instants and picker `Date`s in a timezone.

### Field Configuration

Each field in the `fields` array supports:

```typescript
interface FieldDef {
  name: string;              // Property name in the schema
  type: FormFieldType;       // Field type from enum
  label: string;             // Display label
  required?: boolean;        // Validation: field is required
  minLength?: number;        // Validation: minimum string length
  maxLength?: number;        // Validation: maximum string length
  min?: number;              // For number and range fields
  max?: number;              // For number and range fields
  step?: number;             // For number and range fields
  options?: FieldOption[];   // For radio/select: [ { label, value }, ... ]
  dateTimeConfig?: DateTimeConfig; // For business-date, business-time and instant-date-time
  hidden?: boolean;          // Hide from UI but keep in form
  disabled?: boolean;        // Disable input (read-only)
  hint?: string;             // Short explanatory text shown under the label
  maxWidth?: string;         // CSS max-width override, Eg '900px'. Defaults to 400px.
}
```

### Utility Functions

- `defineSchema()` - Type-safe schema configuration helper
- `createEmptyEntity()` - Create an empty entity with required base properties
- `toSchema()` - Convert field definitions to validation schema

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
