import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { form } from '@angular/forms/signals';
import {
  BusinessDateField,
  BusinessTimeField,
  CheckboxField,
  ChipsField,
  FieldDef,
  InstantDateTimeField,
  RadioField,
  SelectField,
  SliderField,
  TextField,
  TextareaField,
  ThemeField,
  toSchema,
} from '@wiltech-labs/ngx-forms';

/**
 * Every field component takes a `[fieldDef]` and a `[field]` — no `DynamicForm` needed — so they
 * can be placed one at a time in a caller's own layout. This host wraps a single field in a
 * one-property schema so each standalone-field story can bind to it directly; the model behind a
 * real field like this can be any plain object, not just a `BaseSchema`.
 */
@Component({
  selector: 'sb-standalone-field-host',
  standalone: true,
  imports: [
    JsonPipe,
    TextField,
    TextareaField,
    CheckboxField,
    RadioField,
    SelectField,
    ChipsField,
    SliderField,
    ThemeField,
    BusinessDateField,
    BusinessTimeField,
    InstantDateTimeField,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="Story-stack" style="max-width: 420px">
      @switch (fieldDef().type) {
        @case ('textarea') {
          <ngx-textarea-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('checkbox') {
          <ngx-checkbox-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('radio') {
          <ngx-radio-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('select') {
          <ngx-select-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('chips') {
          <ngx-chips-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('range') {
          <ngx-slider-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('theme') {
          <ngx-theme-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('business-date') {
          <ngx-business-date-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('business-time') {
          <ngx-business-time-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @case ('instant-date-time') {
          <ngx-instant-date-time-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
        @default {
          <ngx-text-field [fieldDef]="fieldDef()" [field]="fieldTree" />
        }
      }
      <pre class="Story-output">value = {{ currentValue() | json }}</pre>
    </div>
  `,
})
export class StandaloneFieldHost {
  public readonly fieldDef = input.required<FieldDef>();
  public readonly initialValue = input<unknown>('');

  protected readonly model = signal({ value: this.initialValue() });
  private readonly rootForm = form(
    this.model,
    toSchema<{ value: unknown }>([{ ...this.fieldDef(), name: 'value' }]) as never,
  );

  protected readonly fieldTree = this.rootForm.value;
  protected readonly currentValue = computed(() => this.rootForm().value().value);
}
