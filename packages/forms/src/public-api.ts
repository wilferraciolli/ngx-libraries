// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Dynamic Form
export { DynamicForm } from './lib/dynamic-form/components/dynamic-form/dynamic-form';
export { ErrorDetails } from './lib/dynamic-form/shared/error-details/error-details';
export { TextField } from './lib/dynamic-form/components/text-field/text-field';
export { InstantDateTimeField } from './lib/dynamic-form/components/instant-date-time-field/instant-date-time-field';
export { BusinessDateField } from './lib/dynamic-form/components/business-date-field/business-date-field';
export { BusinessTimeField } from './lib/dynamic-form/components/business-time-field/business-time-field';

// Dynamic Form Interfaces
export type { BaseSchema, SchemaConfig } from './lib/dynamic-form/interfaces/base.schema';
export type { FieldDef, FieldOption } from './lib/dynamic-form/interfaces/field-definition';

// Dynamic Form Constants
export { FormFieldType } from './lib/dynamic-form/constants/form-field.constant';
export type { DateTimeConfig, DateTimeDisambiguation } from './lib/dynamic-form/constants/date-time.constants';

// Dynamic Form Services
export { ZonedDateTimeService } from './lib/dynamic-form/services/zoned-date-time.service';
export type { ZonedInstantResult } from './lib/dynamic-form/services/zoned-date-time.service';

// Dynamic Form Utils
export { createEmptyEntity, defineSchema, toSchema } from './lib/dynamic-form/utils/dynamic-form.utils';
