import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DynamicForm,
  BaseSchema,
  defineSchema,
  FormFieldType,
  createEmptyEntity
} from '@wiltech-labs/ngx-forms';

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  subscribe: boolean;
}

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicForm],
  templateUrl: './forms-demo.component.html',
  styleUrls: ['./forms-demo.component.css']
})
export class FormsDemoComponent {
  formConfig: BaseSchema<any>;
  formData: any;
  submittedData: any = null;

  constructor() {
    this.formConfig = defineSchema<UserForm>({
      firstName: {
        label: 'First Name',
        fieldType: FormFieldType.Text,
        value: '',
        required: true
      },
      lastName: {
        label: 'Last Name',
        fieldType: FormFieldType.Text,
        value: '',
        required: true
      },
      email: {
        label: 'Email',
        fieldType: FormFieldType.Email,
        value: '',
        required: true
      },
      country: {
        label: 'Country',
        fieldType: FormFieldType.Select,
        value: '',
        required: true,
        options: [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Australia', value: 'AU' }
        ]
      },
      subscribe: {
        label: 'Subscribe to newsletter',
        fieldType: FormFieldType.Checkbox,
        value: false
      }
    });

    this.formData = createEmptyEntity<UserForm>();
  }

  onFormSubmit(data: any) {
    this.submittedData = data;
    console.log('Form submitted:', data);
  }

  resetForm() {
    this.formData = createEmptyEntity<UserForm>();
    this.submittedData = null;
  }
}
