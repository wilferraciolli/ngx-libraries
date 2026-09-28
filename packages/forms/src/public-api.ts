// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Dynamic Form
export { DynamicForm } from './lib/dynamic-form/components/dynamic-form/dynamic-form';
export { ErrorDetails } from './lib/dynamic-form/shared/error-details/error-details';
export { UtcDateTimeField } from './lib/dynamic-form/components/utc-date-time-field/utc-date-time-field';
export { UtcDateTimeCustomField } from './lib/dynamic-form/components/utc-date-time-custom-field/utc-date-time-custom-field';

// Dynamic Form Interfaces
export type { BaseSchema, SchemaConfig } from './lib/dynamic-form/interfaces/base.schema';
export type { FieldDef, FieldOption } from './lib/dynamic-form/interfaces/field-definition';

// Dynamic Form Constants
export { FormFieldType } from './lib/dynamic-form/constants/form-field.constant';
export type { UtcDateTimeConfig, UtcDateTimeDisambiguation } from './lib/dynamic-form/constants/utc-date-time.constants';

// Dynamic Form Utils
export { createEmptyEntity, defineSchema, toSchema } from './lib/dynamic-form/utils/dynamic-form.utils';
