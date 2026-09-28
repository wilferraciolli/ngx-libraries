import type { FieldDef } from '../interfaces/field-definition';
import { maxLength, minLength, required, schema, validate } from '@angular/forms/signals';
import type { Schema } from '@angular/forms/signals';
import type { BaseSchema, SchemaConfig } from '../interfaces/base.schema';
import { FormFieldType } from '../constants/form-field.constant';
import {
  UTC_DATE_TIME_INVALID_ERROR_LABEL,
  UTC_DATE_TIME_MAX_ERROR_LABEL,
  UTC_DATE_TIME_MIN_ERROR_LABEL
} from '../constants/utc-date-time.constants';
import { parseUtcInstant } from './utc-date-time.utils';
import { Temporal } from 'temporal-polyfill';

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

export function toSchema<T extends BaseSchema>(meta: FieldDef[]): Schema<T> {
  return schema<T>((path: any) => {
      for (const fieldDef of meta) {
        const property: string = fieldDef.name;
        const fieldPath: any = (path as any)[property];

        if (!fieldPath) {
          continue;
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

        if (fieldDef.type === FormFieldType.DATE_TIME_UTC || fieldDef.type === FormFieldType.DATE_TIME_UTC_CUSTOM) {
          validate(fieldPath, (ctx: any) => {
            const value = ctx.value() as string | null;
            if (!value) {
              return null; // `required` above already covers the empty case
            }

            const instant = parseUtcInstant(value);
            if (!instant) {
              return { kind: 'invalidUtcDateTime', message: UTC_DATE_TIME_INVALID_ERROR_LABEL };
            }

            const minUtc = fieldDef.dateTimeConfig?.minUtc;
            const min = parseUtcInstant(minUtc);
            if (min && Temporal.Instant.compare(instant, min) < 0) {
              return { kind: 'cannotBeBeforeMinUtcDateTime', message: `${UTC_DATE_TIME_MIN_ERROR_LABEL}${minUtc}` };
            }

            const maxUtc = fieldDef.dateTimeConfig?.maxUtc;
            const max = parseUtcInstant(maxUtc);
            if (max && Temporal.Instant.compare(instant, max) > 0) {
              return { kind: 'cannotBeAfterMaxUtcDateTime', message: `${UTC_DATE_TIME_MAX_ERROR_LABEL}${maxUtc}` };
            }

            return null;
          });
        }
      }
    }
  );
}
