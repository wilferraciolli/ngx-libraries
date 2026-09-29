import { FormFieldType } from '../constants/form-field.constant';
import type { DateTimeConfig } from '../constants/date-time.constants';
import type { BaseSchema, SchemaConfig } from '../interfaces/base.schema';
import type { FieldDef, FieldOption } from '../interfaces/field-definition';
import { createEmptyEntity } from '../utils/dynamic-form.utils';

/** A property of the schema that can be a form field. */
export type FieldName<T> = Exclude<Extract<keyof T, string>, 'schemaType'>;

/** Everything on a FieldDef except what the builder method already sets. */
export type FieldOptions = Omit<FieldDef, 'name' | 'type' | 'label' | 'options' | 'dateTimeConfig'>;

/** FieldOptions plus the dateTimeConfig for the business-date, business-time and instant-date-time fields. */
export type DateTimeFieldOptions = FieldOptions & { dateTimeConfig?: DateTimeConfig };

/**
 * Fluent, type-checked way to build a SchemaConfig for DynamicForm. Field names are checked against
 * the schema, so a typo or renamed property fails at compile time.
 *
 * @example
 * const config = formConfig<FlightSchema>('flight')
 *   .text('from', 'Departure City', { required: true, minLength: 3 })
 *   .instantDateTime('date', 'Departure', { required: true, dateTimeConfig: { timeZone: 'Europe/London' } })
 *   .checkbox('delayed', 'Delayed')
 *   .build({ from: '', date: '', delayed: false });
 */
export class FormConfigBuilder<T extends BaseSchema> {
  private readonly fieldDefs: FieldDef[] = [];

  constructor(private readonly schemaType: T['schemaType']) {}

  public text(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.TEXT, name, label, options);
  }

  /** Text input with the email keyboard/autofill and a valid-email check. */
  public email(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.EMAIL, name, label, options);
  }

  public password(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.PASSWORD, name, label, options);
  }

  public search(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.SEARCH, name, label, options);
  }

  public number(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.NUMBER, name, label, options);
  }

  public textarea(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.TEXTAREA, name, label, options);
  }

  public code(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.CODE, name, label, options);
  }

  public checkbox(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.CHECKBOX, name, label, options);
  }

  /** Slider bounded by `options.min`/`max`/`step` (defaults 0-100, step 1). */
  public range(name: FieldName<T>, label: string, options?: FieldOptions): this {
    return this.add(FormFieldType.RANGE, name, label, options);
  }

  public radio(name: FieldName<T>, label: string, choices: FieldOption[], options?: FieldOptions): this {
    return this.add(FormFieldType.RADIO, name, label, { ...options, options: choices });
  }

  public select(name: FieldName<T>, label: string, choices: FieldOption[], options?: FieldOptions): this {
    return this.add(FormFieldType.SELECT, name, label, { ...options, options: choices });
  }

  /** Calendar date with no timezone, stored as 'YYYY-MM-DD'. */
  public businessDate(name: FieldName<T>, label: string, options?: DateTimeFieldOptions): this {
    return this.add(FormFieldType.BUSINESS_DATE, name, label, options);
  }

  /** Time of day with no timezone, stored as 'HH:mm'. */
  public businessTime(name: FieldName<T>, label: string, options?: DateTimeFieldOptions): this {
    return this.add(FormFieldType.BUSINESS_TIME, name, label, options);
  }

  /** Exact moment, stored as a UTC instant and edited in `dateTimeConfig.timeZone`. */
  public instantDateTime(name: FieldName<T>, label: string, options?: DateTimeFieldOptions): this {
    return this.add(FormFieldType.INSTANT_DATE_TIME, name, label, options);
  }

  /** A field that is part of the model and its validation, but never rendered. */
  public hidden(name: FieldName<T>, options?: FieldOptions): this {
    return this.add(FormFieldType.TEXT, name, name, { ...options, hidden: true });
  }

  /** The field definitions added so far, Eg to pass to `toSchema()` or DynamicForm's metaInfo. */
  public fields(): FieldDef[] {
    return [...this.fieldDefs];
  }

  /** The full config for DynamicForm; `id` and `schemaType` are filled in on the initial value. */
  public build(initialValue: Omit<T, 'id' | 'schemaType'>): SchemaConfig<T> {
    return {
      schemaType: this.schemaType,
      fields: this.fields(),
      initialValue: createEmptyEntity<T>(this.schemaType, initialValue)
    };
  }

  private add(type: FormFieldType, name: string, label: string, options?: Partial<FieldDef>): this {
    this.fieldDefs.push({ ...options, name, type, label });
    return this;
  }
}

/** Starts a FormConfigBuilder for schema `T`. */
export function formConfig<T extends BaseSchema>(schemaType: T['schemaType']): FormConfigBuilder<T> {
  return new FormConfigBuilder<T>(schemaType);
}
