import { FormFieldType } from '../constants/form-field.constant';
import type { DateTimeConfig } from '../constants/date-time.constants';

export interface FieldOption {
  label: string;
  value: string | number | boolean;
}

export interface FieldDef {
  name: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp | string;            // A RegExp is used as-is; a string must match the whole value
  patternMessage?: string;              // Shown when `pattern` doesn't match. Defaults to "<label> is not in the expected format".
  min?: number;                         // For number and range fields
  max?: number;                         // For number and range fields
  step?: number;                        // For number and range fields
  options?: FieldOption[];              // For radio buttons and select dropdowns
  orientation?: 'horizontal' | 'vertical'; // For radio buttons: a wrapping row (default) or one option per line
  dateTimeConfig?: DateTimeConfig;      // For business-date, business-time and instant-date-time

  hidden?: boolean;         // Hide the field from display
  disabled?: boolean;       // Disable the field (read-only)
  hint?: string;            // Short explanatory text shown under the label
  maxWidth?: string;        // CSS max-width override, Eg '900px' or '100%'. Defaults to 400px.
}
