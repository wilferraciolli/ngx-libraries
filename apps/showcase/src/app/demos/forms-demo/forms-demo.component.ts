import { Component, computed, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import { Temporal } from 'temporal-polyfill';
import {
  DynamicForm,
  defineSchema,
  FormFieldType,
  createEmptyEntity,
  toSchema
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
  { id: 'Australia/Lord_Howe', value: 'Lord Howe (30 min DST)' }
];

const DEMO_LOCALES: DemoOption[] = [
  { id: 'en-GB', value: 'English (UK) — 31/12/2026' },
  { id: 'en-US', value: 'English (US) — 12/31/2026' },
  { id: 'de-DE', value: 'German — 31.12.2026' },
  { id: 'ja-JP', value: 'Japanese — 2026/12/31' }
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

// All Fields Demo Schema (showcases all field types)
interface AllFieldsSchema extends BaseSchema {
  schemaType: 'allFields';
  username: string;
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
}

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    DynamicForm,
    JsonPipe,
    MatDivider,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption
  ],
  templateUrl: './forms-demo.component.html',
  styleUrls: ['./forms-demo.component.css']
})
export class FormsDemoComponent {
  // ============ FLIGHTS FORM ============
  protected readonly flightFormConfig: SchemaConfig<FlightSchema> = defineSchema<FlightSchema>({
    schemaType: 'flight',
    fields: [
      { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
      {
        name: 'from',
        type: FormFieldType.TEXT,
        label: 'Departure City',
        required: true,
        minLength: 3,
        maxLength: 20,
      },
      {
        name: 'to',
        type: FormFieldType.TEXT,
        label: 'Destination City',
        required: true,
        minLength: 3,
        maxLength: 20
      },
      {
        name: 'date',
        type: FormFieldType.INSTANT_DATE_TIME,
        label: 'Departure Date & Time',
        required: true
      },
      { name: 'delayed', type: FormFieldType.CHECKBOX, label: 'Delayed' }
    ],
    initialValue: createEmptyEntity<FlightSchema>('flight', {
      from: '',
      to: '',
      date: '',
      delayed: false
    })
  });

  protected readonly flightEntity: WritableSignal<FlightSchema> = signal(this.flightFormConfig.initialValue);
  protected readonly flightsForm = form(
    this.flightEntity,
    toSchema<FlightSchema>(this.flightFormConfig.fields)
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
  protected readonly appointmentFormConfig: SchemaConfig<AppointmentSchema> = defineSchema<AppointmentSchema>({
    schemaType: 'appointment',
    fields: [
      { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
      { name: 'name', type: FormFieldType.TEXT, label: 'Appointment Name', required: true, minLength: 3, maxLength: 30 },
      { name: 'startDate', type: FormFieldType.BUSINESS_DATE, label: 'Date', required: true },
      { name: 'startTime', type: FormFieldType.BUSINESS_TIME, label: 'Time', required: true },
      { name: 'duration', type: FormFieldType.NUMBER, label: 'Duration (minutes)', required: true }
    ],
    initialValue: createEmptyEntity<AppointmentSchema>('appointment', {
      name: '',
      startDate: '',
      startTime: '',
      duration: 0
    })
  });

  protected readonly appointmentEntity: WritableSignal<AppointmentSchema> = signal(this.appointmentFormConfig.initialValue);
  protected readonly appointmentForm = form(
    this.appointmentEntity,
    toSchema<AppointmentSchema>(this.appointmentFormConfig.fields)
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
  protected readonly allFieldsFormConfig: SchemaConfig<AllFieldsSchema> = defineSchema<AllFieldsSchema>({
    schemaType: 'allFields',
    fields: [
      { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
      {
        name: 'username',
        type: FormFieldType.TEXT,
        label: 'Username',
        required: true,
        minLength: 3,
        maxLength: 20,
        hint: 'Short, single-line text — names, identifiers, anything that fits on one line.'
      },
      {
        name: 'password',
        type: FormFieldType.PASSWORD,
        label: 'Password',
        required: true,
        minLength: 8,
        hint: 'Same as text, but the browser masks what\'s typed.'
      },
      {
        name: 'searchQuery',
        type: FormFieldType.SEARCH,
        label: 'Search Query',
        maxLength: 50,
        hint: 'Same as text, but some browsers add a clear ("x") button and search-specific keyboard on mobile.'
      },
      {
        name: 'birthDate',
        type: FormFieldType.BUSINESS_DATE,
        label: 'Birth Date',
        required: true,
        hint: 'A calendar date with no timezone (stored as YYYY-MM-DD) — birthdays, holidays, due dates.'
      },
      {
        name: 'appointmentTime',
        type: FormFieldType.BUSINESS_TIME,
        label: 'Appointment Time',
        required: true,
        hint: 'A time of day with no date or timezone (stored as HH:mm) — opening hours, daily schedules.'
      },
      {
        name: 'eventDateTime',
        type: FormFieldType.INSTANT_DATE_TIME,
        label: 'Event Date & Time',
        required: true,
        hint: 'An exact moment (stored as a UTC instant), edited in a timezone — meetings, deadlines, flights. See the Date & Time tab.'
      },
      {
        name: 'gender',
        type: FormFieldType.RADIO,
        label: 'Gender',
        required: true,
        hint: 'A small, fixed set of mutually-exclusive options where every choice should be visible at once.',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
          { label: 'Prefer not to say', value: 'not_specified' }
        ]
      },
      {
        name: 'country',
        type: FormFieldType.SELECT,
        label: 'Country',
        required: true,
        hint: 'A longer list of mutually-exclusive options, collapsed into a dropdown to save space.',
        options: [
          { label: 'Select a country...', value: '' },
          { label: 'United States', value: 'us' },
          { label: 'United Kingdom', value: 'uk' },
          { label: 'Canada', value: 'ca' },
          { label: 'Australia', value: 'au' },
          { label: 'Germany', value: 'de' },
          { label: 'France', value: 'fr' },
          { label: 'Japan', value: 'jp' }
        ]
      },
      {
        name: 'acceptTerms',
        type: FormFieldType.CHECKBOX,
        label: 'Accept Terms & Conditions',
        required: true,
        hint: 'A single yes/no toggle.'
      },
      {
        name: 'age',
        type: FormFieldType.NUMBER,
        label: 'Age',
        required: true,
        hint: 'Numeric input with the browser\'s built-in up/down steppers and numeric keyboard on mobile.'
      },
      {
        name: 'satisfaction',
        type: FormFieldType.RANGE,
        label: 'Satisfaction Level (1-10)',
        hint: 'Picking a value within a known range matters more than typing an exact number.',
        min: 1,
        max: 10,
        step: 1
      },
      {
        name: 'bio',
        type: FormFieldType.TEXTAREA,
        label: 'Bio',
        maxLength: 500,
        hint: 'Free-form text that may run to multiple lines — notes, descriptions, comments.',
        maxWidth: '900px'
      },
      {
        name: 'snippet',
        type: FormFieldType.CODE,
        label: 'Favorite Code Snippet',
        hint: 'Code or other formatted/monospaced text. Tab inserts spaces instead of moving focus, like an editor.',
        maxWidth: '900px'
      }
    ],
    initialValue: createEmptyEntity<AllFieldsSchema>('allFields', {
      username: 'jane.doe',
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
      snippet: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}'
    })
  });

  protected readonly allFieldsEntity: WritableSignal<AllFieldsSchema> = signal(this.allFieldsFormConfig.initialValue);
  protected readonly allFieldsForm = form(
    this.allFieldsEntity,
    toSchema<AllFieldsSchema>(this.allFieldsFormConfig.fields)
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
  private readonly dateTimeFieldsBase: FieldDef[] = [
    { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
    {
      name: 'appointment',
      type: FormFieldType.INSTANT_DATE_TIME,
      label: 'Appointment',
      required: true,
      hint: 'An exact moment, stored as a UTC instant and edited in the selected timezone — use it for meetings or deadlines shared across timezones.',
      dateTimeConfig: { min: '2024-01-01T00:00:00Z' }
    },
    {
      name: 'holiday',
      type: FormFieldType.BUSINESS_DATE,
      label: 'Closed on',
      required: true,
      hint: 'A calendar date with no timezone, stored as YYYY-MM-DD — Christmas Day is the 25th wherever you are.',
      dateTimeConfig: { min: '2026-01-01', max: '2026-12-31' }
    },
    {
      name: 'opensAt',
      type: FormFieldType.BUSINESS_TIME,
      label: 'Opens at',
      required: true,
      hint: 'A time of day with no date or timezone, stored as HH:mm — "open from 9" means 09:00 in whichever shop you walk into.',
      dateTimeConfig: { min: '06:00', max: '12:00' }
    },
    {
      name: 'closesAt',
      type: FormFieldType.BUSINESS_TIME,
      label: 'Closes at',
      required: true,
      dateTimeConfig: { min: '12:00', max: '23:30' }
    }
  ];

  protected readonly dateTimeEntity: WritableSignal<DateTimeDemoSchema> = signal(
    createEmptyEntity<DateTimeDemoSchema>('dateTimeDemo', {
      appointment: '2026-05-01T17:00:00Z',
      holiday: '2026-12-25',
      opensAt: '09:00',
      closesAt: '17:00'
    })
  );
  protected readonly dateTimeForm = form(
    this.dateTimeEntity,
    toSchema<DateTimeDemoSchema>(this.dateTimeFieldsBase)
  );

  // Rebuilds metaInfo with the selected timezone and locale — DynamicForm itself only ever sees
  // a static per-field config, this is what makes the two pickers above it live.
  protected readonly dateTimeFields = computed<FieldDef[]>(() =>
    this.dateTimeFieldsBase.map(fieldDef =>
      fieldDef.dateTimeConfig
        ? {
          ...fieldDef,
          dateTimeConfig: { ...fieldDef.dateTimeConfig, timeZone: this.selectedTimezone(), locale: this.selectedLocale() }
        }
        : fieldDef
    )
  );

  protected dateTimeSubmitted: WritableSignal<DateTimeDemoSchema | null> = signal(null);

  protected handleDateTimeSubmit(): void {
    this.dateTimeSubmitted.set(this.dateTimeEntity());
    console.log('Date & time submitted:', this.dateTimeEntity());
  }

  protected handleClearDateTimeForm(): void {
    this.dateTimeEntity.set(createEmptyEntity<DateTimeDemoSchema>('dateTimeDemo', {
      appointment: '',
      holiday: '',
      opensAt: '',
      closesAt: ''
    }));
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
}
