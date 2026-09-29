import { FormFieldType } from '../constants/form-field.constant';
import type { UtcDateTimeConfig } from '../constants/utc-date-time.constants';

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
  min?: number;                         // For number and range fields
  max?: number;                         // For number and range fields
  step?: number;                        // For number and range fields
  options?: FieldOption[];              // For radio buttons and select dropdowns
  dateTimeConfig?: UtcDateTimeConfig;   // For date-time-utc / date-time-utc-custom

  hidden?: boolean;         // Hide the field from display
  disabled?: boolean;       // Disable the field (read-only)
  hint?: string;            // Short explanatory text shown under the label
  maxWidth?: string;        // CSS max-width override, Eg '900px' or '100%'. Defaults to 400px.
}
