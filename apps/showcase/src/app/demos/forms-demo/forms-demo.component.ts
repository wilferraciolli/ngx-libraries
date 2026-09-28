import { Component, computed, signal } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDivider } from '@angular/material/list';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { JsonPipe } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import { Temporal } from 'temporal-polyfill';
import {
  DynamicForm,
  UtcDateTimeCustomField,
  defineSchema,
  FormFieldType,
  createEmptyEntity,
  toSchema
} from '@wiltech-labs/ngx-forms';
import type { BaseSchema, FieldDef, SchemaConfig } from '@wiltech-labs/ngx-forms';

interface TimeZone {
  id: string;
  value: string;
}

const UTC_DEMO_TIMEZONES: TimeZone[] = [
  { id: 'Europe/London', value: 'London' },
  { id: 'Asia/Nicosia', value: 'Nicosia' },
  { id: 'Europe/Athens', value: 'Athens' },
  { id: 'America/Sao_Paulo', value: 'Sao Paulo' },
  { id: 'Asia/Kolkata', value: 'Kolkata (UTC+05:30)' },
  { id: 'Australia/Lord_Howe', value: 'Lord Howe (30 min DST)' }
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

// UTC Appointment Schema (showcases DATE_TIME_UTC / DATE_TIME_UTC_CUSTOM)
interface UtcAppointmentSchema extends BaseSchema {
  schemaType: 'utcAppointment';
  appointment: string;
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
}

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    DynamicForm,
    UtcDateTimeCustomField,
    FormField,
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
        type: FormFieldType.DATE_TIME,
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
      { name: 'startDate', type: FormFieldType.DATE, label: 'Date', required: true },
      { name: 'startTime', type: FormFieldType.TIME, label: 'Time', required: true },
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
      { name: 'username', type: FormFieldType.TEXT, label: 'Username', required: true, minLength: 3, maxLength: 20 },
      { name: 'password', type: FormFieldType.PASSWORD, label: 'Password', required: true, minLength: 8 },
      { name: 'searchQuery', type: FormFieldType.SEARCH, label: 'Search Query', maxLength: 50 },
      { name: 'birthDate', type: FormFieldType.DATE, label: 'Birth Date', required: true },
      { name: 'appointmentTime', type: FormFieldType.TIME, label: 'Appointment Time', required: true },
      { name: 'eventDateTime', type: FormFieldType.DATE_TIME, label: 'Event Date & Time', required: true },
      {
        name: 'gender',
        type: FormFieldType.RADIO,
        label: 'Gender',
        required: true,
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
      { name: 'acceptTerms', type: FormFieldType.CHECKBOX, label: 'Accept Terms & Conditions', required: true },
      { name: 'age', type: FormFieldType.NUMBER, label: 'Age', required: true },
      { name: 'satisfaction', type: FormFieldType.RANGE, label: 'Satisfaction Level (1-10)' }
    ],
    initialValue: createEmptyEntity<AllFieldsSchema>('allFields', {
      username: '',
      password: '',
      searchQuery: '',
      birthDate: '',
      appointmentTime: '',
      eventDateTime: '',
      gender: 'not_specified',
      country: '',
      acceptTerms: false,
      age: 0,
      satisfaction: 5
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

  // ============ UTC DATE/TIME DEMO ============
  protected readonly utcTimezones: TimeZone[] = UTC_DEMO_TIMEZONES;
  protected readonly utcSelectedTimezone: WritableSignal<string> = signal('Europe/London');

  // Static field shape for the schema — required/minUtc/maxUtc never change, only the
  // rendered timeZone does (see utcAppointmentFields below), so this is built once.
  private readonly utcAppointmentFieldsBase: FieldDef[] = [
    { name: 'id', type: FormFieldType.TEXT, label: 'Id', disabled: true, hidden: true },
    {
      name: 'appointment',
      type: FormFieldType.DATE_TIME_UTC,
      label: 'Appointment',
      required: true,
      dateTimeConfig: { minUtc: '2024-01-01T00:00:00Z' }
    }
  ];

  protected readonly utcAppointmentEntity: WritableSignal<UtcAppointmentSchema> = signal(
    createEmptyEntity<UtcAppointmentSchema>('utcAppointment', { appointment: '2026-05-01T17:00:00Z' })
  );
  protected readonly utcAppointmentForm = form(
    this.utcAppointmentEntity,
    toSchema<UtcAppointmentSchema>(this.utcAppointmentFieldsBase)
  );

  // Rebuilds metaInfo with the currently-selected timezone whenever it changes — DynamicForm
  // itself only ever sees a static per-field config, this is what makes the picker live.
  protected readonly utcAppointmentFields = computed<FieldDef[]>(() =>
    this.utcAppointmentFieldsBase.map(fieldDef =>
      fieldDef.name === 'appointment'
        ? { ...fieldDef, dateTimeConfig: { ...fieldDef.dateTimeConfig, timeZone: this.utcSelectedTimezone() } }
        : fieldDef
    )
  );

  protected utcAppointmentSubmitted: WritableSignal<UtcAppointmentSchema | null> = signal(null);

  protected handleUtcAppointmentSubmit(): void {
    this.utcAppointmentSubmitted.set(this.utcAppointmentEntity());
    console.log('UTC appointment submitted:', this.utcAppointmentEntity());
  }

  protected handleClearUtcAppointmentForm(): void {
    this.utcAppointmentEntity.set(createEmptyEntity<UtcAppointmentSchema>('utcAppointment', { appointment: '' }));
    this.utcAppointmentForm().reset();
    this.utcAppointmentSubmitted.set(null);
  }

  /** Converts the current appointment (always stored as a UTC instant) into another timezone's wall-clock time. */
  protected convertAppointmentToTimeZone(timeZone: string): string {
    const currentAppointment = this.utcAppointmentEntity().appointment;
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
