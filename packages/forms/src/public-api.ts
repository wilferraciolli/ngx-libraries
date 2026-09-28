// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Dynamic Form
export { DynamicForm } from './lib/dynamic-form/components/dynamic-form/dynamic-form';
export { ErrorDetails } from './lib/dynamic-form/components/error-details/error-details';

// Dynamic Form Interfaces
export { BaseSchema, SchemaConfig } from './lib/dynamic-form/interfaces/base.schema';
export { FieldDef, FieldOption } from './lib/dynamic-form/interfaces/field-definition';

// Dynamic Form Constants
export { FormFieldType } from './lib/dynamic-form/constants/form-field.constant';

// Dynamic Form Utils
export { createEmptyEntity, defineSchema, toSchema } from './lib/dynamic-form/utils/dynamic-form.utils';
