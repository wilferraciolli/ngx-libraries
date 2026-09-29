// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Dynamic Form
export { DynamicForm } from './lib/dynamic-form/components/dynamic-form/dynamic-form';

// Field components — usable on their own with [fieldDef] + [field]
export { TextField } from './lib/dynamic-form/components/text-field/text-field';
export { TextareaField } from './lib/dynamic-form/components/textarea-field/textarea-field';
export { CheckboxField } from './lib/dynamic-form/components/checkbox-field/checkbox-field';
export { RadioField } from './lib/dynamic-form/components/radio-field/radio-field';
export { SelectField } from './lib/dynamic-form/components/select-field/select-field';
export { SliderField } from './lib/dynamic-form/components/slider-field/slider-field';
export { BusinessDateField } from './lib/dynamic-form/components/business-date-field/business-date-field';
export { BusinessTimeField } from './lib/dynamic-form/components/business-time-field/business-time-field';
export { InstantDateTimeField } from './lib/dynamic-form/components/instant-date-time-field/instant-date-time-field';

// Dynamic Form Interfaces
export type { BaseSchema, SchemaConfig } from './lib/dynamic-form/interfaces/base.schema';
export type { FieldDef, FieldOption } from './lib/dynamic-form/interfaces/field-definition';

// Dynamic Form Builder
export { FormConfigBuilder, formConfig } from './lib/dynamic-form/builders/form-config.builder';
export type { DateTimeFieldOptions, FieldName, FieldOptions } from './lib/dynamic-form/builders/form-config.builder';

// Dynamic Form Constants
export { FormFieldType } from './lib/dynamic-form/constants/form-field.constant';
export type { DateTimeConfig, DateTimeDisambiguation } from './lib/dynamic-form/constants/date-time.constants';

// Dynamic Form Config
export { NGX_FORMS_LOCALE } from './lib/dynamic-form/config/forms-locale.token';
export type { FormsLocaleResolver } from './lib/dynamic-form/config/forms-locale.token';

// Dynamic Form Services
export { ZonedDateTimeService } from './lib/dynamic-form/services/zoned-date-time.service';
export type { ZonedInstantResult } from './lib/dynamic-form/services/zoned-date-time.service';

// Dynamic Form Utils
export { createEmptyEntity, defineSchema, toSchema } from './lib/dynamic-form/utils/dynamic-form.utils';
