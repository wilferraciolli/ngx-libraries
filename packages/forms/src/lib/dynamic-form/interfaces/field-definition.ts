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
  options?: FieldOption[];              // For radio buttons and select dropdowns
  dateTimeConfig?: UtcDateTimeConfig;   // For date-time-utc / date-time-utc-custom

  hidden?: boolean;         // Hide the field from display
  disabled?: boolean;       // Disable the field (read-only)
  hint?: string;            // Short explanatory text shown under the label
}
