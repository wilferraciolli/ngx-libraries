import type { FieldDef } from '../interfaces/field-definition';
import { disabled, max, maxLength, min, minLength, required, schema, validate } from '@angular/forms/signals';
import type { Schema } from '@angular/forms/signals';
import type { BaseSchema, SchemaConfig } from '../interfaces/base.schema';
import { dateTimeError, isDateTimeField } from './date-time.utils';

export function defineSchema<T extends BaseSchema>(config: SchemaConfig<T>): SchemaConfig<T> {
  return config;
}

export function createEmptyEntity<T extends BaseSchema>(schemaType: T['schemaType'], defaults: Omit<T, 'id' | 'schemaType'>): T {
  return {
    id: '',
    schemaType,
    ...defaults,
  } as T;
}

/** Turns field definitions into Signals Forms rules. The model can be any object, not just a BaseSchema. */
export function toSchema<T>(meta: FieldDef[]): Schema<T> {
  return schema<T>((path: any) => {
      for (const fieldDef of meta) {
        const property: string = fieldDef.name;
        const fieldPath: any = (path as any)[property];

        if (!fieldPath) {
          continue;
        }

        if (fieldDef.disabled) {
          disabled(fieldPath);
        }
        if (fieldDef.required) {
          required(fieldPath, { message: `${fieldDef.label} is required` });
        }
        if (typeof fieldDef.minLength !== 'undefined') {
          minLength(fieldPath, fieldDef.minLength, { message: `${fieldDef.label} must be at least ${fieldDef.minLength} characters` });
        }
        if (typeof fieldDef.maxLength !== 'undefined') {
          maxLength(fieldPath, fieldDef.maxLength, { message: `${fieldDef.label} cannot exceed ${fieldDef.maxLength} characters` });
        }
        if (typeof fieldDef.min !== 'undefined') {
          min(fieldPath, fieldDef.min, { message: `${fieldDef.label} must be at least ${fieldDef.min}` });
        }
        if (typeof fieldDef.max !== 'undefined') {
          max(fieldPath, fieldDef.max, { message: `${fieldDef.label} cannot exceed ${fieldDef.max}` });
        }

        if (isDateTimeField(fieldDef.type)) {
          validate(fieldPath, (ctx: any) => dateTimeError(ctx.value() as string | null, fieldDef));
        }
      }
    }
  );
}
