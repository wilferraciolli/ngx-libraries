import { Component, computed, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import type { FieldTree } from '@angular/forms/signals';
import { Temporal } from 'temporal-polyfill';
import {
  BusinessDateField,
  CheckboxField,
  DynamicForm,
  FormFieldType,
  SelectField,
  TextField,
  createEmptyEntity,
  formConfig,
  toSchema,
} from '@wiltech-labs/ngx-forms';
import type { BaseSchema, FieldDef, SchemaConfig } from '@wiltech-labs/ngx-forms';

interface DemoOption {
  id: string;
  value: string;
}

const DEMO_TIMEZONES: DemoOption[] = [
  { id: 'Europe/London', value: 'London' },
  { id: 'Asia/Nicosia', value: 'Nicosia' },
  { id: 'Europe/Athens', value: 'Athens' },
  { id: 'America/Sao_Paulo', value: 'Sao Paulo' },
  { id: 'Asia/Kolkata', value: 'Kolkata (UTC+05:30)' },
  { id: 'Australia/Lord_Howe', value: 'Lord Howe (30 min DST)' },
];

const DEMO_LOCALES: DemoOption[] = [
  { id: 'en-GB', value: 'English (UK) — 31/12/2026 18:05' },
  { id: 'en-US', value: 'English (US) — 12/31/2026 6:05 PM' },
  { id: 'en-CY', value: 'English (Cyprus) — 31/12/2026 6:05 pm' },
  { id: 'el-CY', value: 'Greek (Cyprus) — 31/12/2026 6:05 μ.μ.' },
  { id: 'pt-BR', value: 'Portuguese (Brazil) — 31/12/2026 18:05' },
  { id: 'de-DE', value: 'German — 31.12.2026 18:05' },
  { id: 'ja-JP', value: 'Japanese — 2026/12/31 18:05' },
];

// Flight Schema
interface FlightSchema extends BaseSchema {
  schemaType: 'flight';
  from: string;
  to: string;
  date: string;
  delayed: boolean;
}

// Appointment Schema
interface AppointmentSchema extends BaseSchema {
  schemaType: 'appointment';
  name: string;
  kind: string;
  startDate: string;
  startTime: string;
  duration: number;
}

// Date & Time Schema (showcases INSTANT_DATE_TIME / BUSINESS_DATE / BUSINESS_TIME)
interface DateTimeDemoSchema extends BaseSchema {
  schemaType: 'dateTimeDemo';
  appointment: string;
  holiday: string;
  opensAt: string;
  closesAt: string;
}

// Standalone fields model — a plain object, no BaseSchema needed when not using DynamicForm
interface NewsletterModel {
  email: string;
  startDate: string;
  frequency: string;
  agree: boolean;
}

// All Fields Demo Schema (showcases all field types)
interface AllFieldsSchema extends BaseSchema {
  schemaType: 'allFields';
  username: string;
  email: string;
  password: string;
  searchQuery: string;
  birthDate: string;
  appointmentTime: string;
  eventDateTime: string;
  gender: string;
  country: string;
  acceptTerms: boolean;
  age: number;
  satisfaction: number;
  bio: string;
  snippet: string;
  keywords: string[];
  colorScheme: string;
}

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    DynamicForm,
    TextField,
    BusinessDateField,
    SelectField,
    CheckboxField,
    JsonPipe,
    MatDivider,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './forms-demo.component.html',
  styleUrls: ['./forms-demo.component.css'],
})
export class FormsDemoComponent {
  /** Every current validation message in a form, including fields the user hasn't touched yet. */
  protected validationErrors<T extends object>(form: FieldTree<T>): string[] {
    const fields = form as unknown as Record<string, FieldTree<unknown>>;

    // Skips the message-less duplicates some Material controls add next to the schema's own errors.
    return Object.keys(form().value()).flatMap((name) => {
      const errors = fields[name]?.().errors() ?? [];
      const described = new Set(errors.filter((error) => error.message).map((error) => error.kind));

      return errors
        .filter((error) => error.message || !described.has(error.kind))
        .map((error) => error.message ?? `${name}: ${error.kind}`);
    });
  }

  // ============ FLIGHTS FORM ============
  protected readonly flightFormConfig: SchemaConfig<FlightSchema> = formConfig<FlightSchema>(
    'flight',
  )
    .text('from', 'Departure City', { required: true, minLength: 3, maxLength: 20 })
    .text('to', 'Destination City', { required: true, minLength: 3, maxLength: 20 })
    .instantDateTime('date', 'Departure Date & Time', { required: true })
    .checkbox('delayed', 'Delayed')
    .build({ from: '', to: '', date: '', delayed: false });

  protected readonly flightEntity: WritableSignal<FlightSchema> = signal(
    this.flightFormConfig.initialValue,
  );
  protected readonly flightsForm = form(
    this.flightEntity,
    toSchema<FlightSchema>(this.flightFormConfig.fields),
  );
  protected flightSubmitted: WritableSignal<FlightSchema | null> = signal(null);

  protected handleFlightSubmit(): void {
    this.flightSubmitted.set(this.flightEntity());
    console.log('Flight submitted:', this.flightEntity());
  }

  protected handleClearFlightForm(): void {
    this.flightEntity.set(this.flightFormConfig.initialValue);
    this.flightsForm().reset();
    this.flightSubmitted.set(null);
  }

  // ============ APPOINTMENT FORM ============
  protected readonly appointmentFormConfig: SchemaConfig<AppointmentSchema> =
    formConfig<AppointmentSchema>('appointment')
      .text('name', 'Appointment Name', { required: true, minLength: 3, maxLength: 30 })
      .radio(
        'kind',
        'Type',
        [
          { label: 'In person', value: 'in_person' },
          { label: 'Video call', value: 'video' },
          { label: 'Phone', value: 'phone' },
        ],
        { required: true, hint: 'Horizontal radio (the default orientation).' },
      )
      .businessDate('startDate', 'Date', { required: true })
      .businessTime('startTime', 'Time', { required: true })
      .number('duration', 'Duration (minutes)', { required: true, min: 5, max: 480 })
      .build({ name: '', kind: 'in_person', startDate: '', startTime: '', duration: 30 });

  protected readonly appointmentEntity: WritableSignal<AppointmentSchema> = signal(
    this.appointmentFormConfig.initialValue,
  );
  protected readonly appointmentForm = form(
    this.appointmentEntity,
    toSchema<AppointmentSchema>(this.appointmentFormConfig.fields),
  );
  protected appointmentSubmitted: WritableSignal<AppointmentSchema | null> = signal(null);

  protected handleAppointmentSubmit(): void {
    this.appointmentSubmitted.set(this.appointmentEntity());
    console.log('Appointment submitted:', this.appointmentEntity());
  }

  protected handleClearAppointmentForm(): void {
    this.appointmentEntity.set(this.appointmentFormConfig.initialValue);
    this.appointmentForm().reset();
    this.appointmentSubmitted.set(null);
  }

  // ============ ALL FIELDS DEMO ============
  protected readonly allFieldsFormConfig: SchemaConfig<AllFieldsSchema> =
    formConfig<AllFieldsSchema>('allFields')
      .text('username', 'Username', {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: '[a-z0-9.]+',
        patternMessage: 'Username can only use lowercase letters, digits and dots',
        hint: 'Short, single-line text — names, identifiers. This one also has a pattern: lowercase letters, digits and dots.',
      })
      .email('email', 'Email', {
        required: true,
        hint: 'Text with the email keyboard on mobile, browser autofill, and a valid-address check.',
      })
      .password('password', 'Password', {
        required: true,
        minLength: 8,
        hint: "Same as text, but the browser masks what's typed.",
      })
      .search('searchQuery', 'Search Query', {
        maxLength: 50,
        hint: 'Same as text, but some browsers add a clear ("x") button and search-specific keyboard on mobile.',
      })
      .businessDate('birthDate', 'Birth Date', {
        required: true,
        hint: 'A calendar date with no timezone (stored as YYYY-MM-DD) — birthdays, holidays, due dates.',
      })
      .businessTime('appointmentTime', 'Appointment Time', {
        required: true,
        hint: 'A time of day with no date or timezone (stored as HH:mm) — opening hours, daily schedules.',
      })
      .instantDateTime('eventDateTime', 'Event Date & Time', {
        required: true,
        hint: 'An exact moment (stored as a UTC instant), edited in a timezone — meetings, deadlines, flights. See the Date & Time tab.',
      })
      .radio(
        'gender',
        'Gender',
        [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
          { label: 'Prefer not to say', value: 'not_specified' },
        ],
        {
          required: true,
          orientation: 'vertical',
          hint: "A small, fixed set of mutually-exclusive options where every choice should be visible at once. Shown with orientation: 'vertical'.",
        },
      )
      .select(
        'country',
        'Country',
        [
          { label: 'United States', value: 'us' },
          { label: 'United Kingdom', value: 'uk' },
          { label: 'Canada', value: 'ca' },
          { label: 'Australia', value: 'au' },
          { label: 'Germany', value: 'de' },
          { label: 'France', value: 'fr' },
          { label: 'Japan', value: 'jp' },
        ],
        {
          required: true,
          hint: 'A longer list of mutually-exclusive options, collapsed into a dropdown to save space.',
        },
      )
      .number('age', 'Age', {
        required: true,
        min: 0,
        max: 130,
        hint: 'A whole number, with a numeric keyboard on mobile.',
      })
      .range('satisfaction', 'Satisfaction Level (1-10)', {
        min: 1,
        max: 10,
        step: 1,
        hint: 'Picking a value within a known range matters more than typing an exact number.',
      })
      .textarea('bio', 'Bio', {
        maxLength: 500,
        maxWidth: '900px',
        hint: 'Free-form text that may run to multiple lines — notes, descriptions, comments.',
      })
      .code('snippet', 'Favorite Code Snippet', {
        maxWidth: '900px',
        hint: 'Code or other formatted/monospaced text. Tab inserts spaces instead of moving focus, like an editor.',
      })
      .checkbox('acceptTerms', 'Accept Terms & Conditions', {
        required: true,
        hint: 'A single yes/no toggle. On a checkbox, required means it must be ticked.',
      })
      .chips('keywords', 'Keywords', {
        maxWidth: '900px',
        hint: 'Type a word and press Enter (or comma) to add it as a chip; click the x to remove one.',
      })
      .theme(
        'colorScheme',
        'Color Scheme',
        [
          { label: 'Day', value: 'light' },
          { label: 'Night', value: 'dark' },
        ],
        {
          hint: 'A fixed light/dark choice, shown as a sun/moon icon toggle instead of a dropdown.',
        },
      )
      .build({
        username: 'jane.doe',
        email: 'jane.doe@example.com',
        password: '',
        searchQuery: 'angular signals forms',
        birthDate: '1990-06-15',
        appointmentTime: '14:30',
        eventDateTime: '2026-11-05T09:00:00Z',
        gender: 'not_specified',
        country: 'uk',
        acceptTerms: false,
        age: 29,
        satisfaction: 7,
        bio: 'Full-stack engineer who likes strongly-typed forms and hates YAML.\n\nBased in Cyprus, previously London. Always up for a good debugging story.',
        snippet: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}',
        keywords: ['angular', 'signals', 'typescript'],
        colorScheme: 'light',
      });

  protected readonly allFieldsEntity: WritableSignal<AllFieldsSchema> = signal(
    this.allFieldsFormConfig.initialValue,
  );
  protected readonly allFieldsForm = form(
    this.allFieldsEntity,
    toSchema<AllFieldsSchema>(this.allFieldsFormConfig.fields),
  );
  protected allFieldsSubmitted: WritableSignal<AllFieldsSchema | null> = signal(null);

  protected handleAllFieldsSubmit(): void {
    this.allFieldsSubmitted.set(this.allFieldsEntity());
    console.log('All Fields Form submitted:', this.allFieldsEntity());
  }

  protected handleClearAllFieldsForm(): void {
    this.allFieldsEntity.set(this.allFieldsFormConfig.initialValue);
    this.allFieldsForm().reset();
    this.allFieldsSubmitted.set(null);
  }

  // ============ DATE & TIME DEMO ============
  protected readonly timezones: DemoOption[] = DEMO_TIMEZONES;
  protected readonly locales: DemoOption[] = DEMO_LOCALES;
  protected readonly selectedTimezone: WritableSignal<string> = signal('Europe/London');
  protected readonly selectedLocale: WritableSignal<string> = signal('en-GB');

  // Static field shape for the schema — required/min/max never change, only the rendered
  // timeZone and locale do (see dateTimeFields below), so this is built once.
  private readonly dateTimeFormConfig: SchemaConfig<DateTimeDemoSchema> =
    formConfig<DateTimeDemoSchema>('dateTimeDemo')
      .instantDateTime('appointment', 'Appointment', {
        required: true,
        hint: 'An exact moment, stored as a UTC instant and edited in the selected timezone — use it for meetings or deadlines shared across timezones.',
        dateTimeConfig: { min: '2024-01-01T00:00:00Z' },
      })
      .businessDate('holiday', 'Closed on', {
        required: true,
        hint: 'A calendar date with no timezone, stored as YYYY-MM-DD — Christmas Day is the 25th wherever you are.',
        dateTimeConfig: { min: '2026-01-01', max: '2026-12-31' },
      })
      .businessTime('opensAt', 'Opens at', {
        required: true,
        hint: 'A time of day with no date or timezone, stored as HH:mm — "open from 9" means 09:00 in whichever shop you walk into.',
        dateTimeConfig: { min: '06:00', max: '12:00' },
      })
      .businessTime('closesAt', 'Closes at', {
        required: true,
        dateTimeConfig: { min: '12:00', max: '23:30' },
      })
      .build({
        appointment: '2026-05-01T17:00:00Z',
        holiday: '2026-12-25',
        opensAt: '09:00',
        closesAt: '17:00',
      });

  protected readonly dateTimeEntity: WritableSignal<DateTimeDemoSchema> = signal(
    this.dateTimeFormConfig.initialValue,
  );
  protected readonly dateTimeForm = form(
    this.dateTimeEntity,
    toSchema<DateTimeDemoSchema>(this.dateTimeFormConfig.fields),
  );

  // Rebuilds metaInfo with the selected timezone and locale — DynamicForm itself only ever sees
  // a static per-field config, this is what makes the two pickers above it live.
  protected readonly dateTimeFields = computed<FieldDef[]>(() =>
    this.dateTimeFormConfig.fields.map((fieldDef) =>
      fieldDef.dateTimeConfig
        ? {
            ...fieldDef,
            dateTimeConfig: {
              ...fieldDef.dateTimeConfig,
              timeZone: this.selectedTimezone(),
              locale: this.selectedLocale(),
            },
          }
        : fieldDef,
    ),
  );

  protected dateTimeSubmitted: WritableSignal<DateTimeDemoSchema | null> = signal(null);

  protected handleDateTimeSubmit(): void {
    this.dateTimeSubmitted.set(this.dateTimeEntity());
    console.log('Date & time submitted:', this.dateTimeEntity());
  }

  protected handleClearDateTimeForm(): void {
    this.dateTimeEntity.set(
      createEmptyEntity<DateTimeDemoSchema>('dateTimeDemo', {
        appointment: '',
        holiday: '',
        opensAt: '',
        closesAt: '',
      }),
    );
    this.dateTimeForm().reset();
    this.dateTimeSubmitted.set(null);
  }

  /** Converts the current appointment (always stored as a UTC instant) into another timezone's wall-clock time. */
  protected convertAppointmentToTimeZone(timeZone: string): string {
    const currentAppointment = this.dateTimeEntity().appointment;
    if (!currentAppointment) {
      return '';
    }

    try {
      return Temporal.Instant.from(currentAppointment)
        .toZonedDateTimeISO(timeZone)
        .toPlainDateTime()
        .toString({ smallestUnit: 'minute' })
        .replace('T', ' ');
    } catch {
      return '';
    }
  }

  // ============ STANDALONE FIELDS ============
  // The same field components DynamicForm uses, placed one by one in your own layout.
  protected readonly newsletterFields = {
    email: {
      name: 'email',
      type: FormFieldType.EMAIL,
      label: 'Email',
      required: true,
      hint: 'Where the newsletter goes.',
    },
    startDate: {
      name: 'startDate',
      type: FormFieldType.BUSINESS_DATE,
      label: 'Start from',
      required: true,
      dateTimeConfig: { min: '2026-01-01' },
    },
    frequency: {
      name: 'frequency',
      type: FormFieldType.SELECT,
      label: 'How often',
      options: [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
      ],
    },
    agree: {
      name: 'agree',
      type: FormFieldType.CHECKBOX,
      label: 'I agree to receive emails',
      required: true,
    },
  } satisfies Record<keyof NewsletterModel, FieldDef>;

  protected readonly newsletterModel: WritableSignal<NewsletterModel> = signal({
    email: '',
    startDate: '',
    frequency: 'weekly',
    agree: false,
  });
  protected readonly newsletterForm = form(
    this.newsletterModel,
    toSchema<NewsletterModel>(Object.values(this.newsletterFields)),
  );
}
